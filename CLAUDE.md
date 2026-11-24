# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RepairDriver is a home maintenance services marketplace connecting homeowners with professional technicians (electricians, plumbers, HVAC, etc.), targeting the Saudi market (SAR currency, Arabic-first UI).

The platform consists of three applications:
1. **Customer App** (mobile) - Request services, track technicians, chat, pay, review
2. **Technician App** (mobile) - Professional profiles, request radar, quoting/inspection workflow, wallet
3. **Admin Dashboard** (web) - User verification, financial reports, dispute resolution — **not started**

## Repository Layout

- `RepairDriver.md` — Product requirements (PRD), including the full data schema (Section 6)
- `ProposedScreens/` — HTML + PNG design mockups for key screens; use as visual reference when building UI
- `RepairDriverApp/` — Expo app containing both the customer and technician experiences

## Current Status

The mobile app is an early scaffold:
- Routing, auth flow, layouts, UI components, and i18n are in place
- Only auth/profile logic (`src/contexts/AuthContext.tsx`) talks to Supabase; customer/technician screens render static placeholder data
- Not yet implemented: Supabase schema/RLS migrations, Realtime chat & tracking, maps (`react-native-maps` is not installed yet), payments, reviews, push notifications, Apple/Google sign-in, admin dashboard

## Commands

Run from `RepairDriverApp/`:

```bash
npm install
cp .env.example .env    # set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
npm start               # Expo dev server (also: npm run android | ios | web)
npx tsc --noEmit        # type-check
```

There is no test runner or linter configured.

## App Architecture (`RepairDriverApp/`)

- **Routing (Expo Router, `app/`)**:
  - `app/index.tsx` — entry gate: redirects to `/auth/login` (no session) → `/auth/user-type` (no user type) → `/technician` or `/customer`
  - `app/auth/` — `login` (phone) → `otp` → `user-type`
  - `app/customer/` — tabs: `index` (home), `bookings`, `new-request`, `messages`, `profile`
  - `app/technician/` — tabs: `index` (request radar), `jobs`, `wallet`, `profile`
- **`src/contexts/AuthContext.tsx`** — Supabase session, `profiles` fetch, phone OTP sign-in, user type; consume via `useAuth()`
- **`src/lib/supabase.ts`** — Supabase client (AsyncStorage session persistence), configured via `EXPO_PUBLIC_*` env vars
- **`src/lib/constants.ts`** — color palette, `COMMISSION_RATE`, `NEGATIVE_WALLET_LIMIT`, `DEFAULT_INSPECTION_FEE`, `DEFAULT_WARRANTY_DAYS`, `MAX_PHOTOS`, service icons. Use these instead of hard-coding business values
- **`src/types/database.ts`** — TypeScript types mirroring the DB schema; keep in sync with `RepairDriver.md` Section 6
- **`src/components/ui/`** — shared `Button`, `Card`, `Input`, `EmptyState`, `ServiceIcon`, `StatusBadge`
- **i18n (`src/i18n/`)** — i18next with `ar` (default + fallback) and `en`. All user-facing strings go in **both** `ar.ts` and `en.ts`. `src/hooks/useRTL.ts` toggles RTL via `I18nManager` based on language

## Technology Stack

- **Frontend:** Expo SDK 55, React Native 0.83, React 19, TypeScript, Expo Router
- **Styling:** NativeWind v4 (Tailwind CSS 3) — Primary: `#231a73`, Secondary: `#eeeeee` (see `tailwind.config.js`)
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Auth:** Phone OTP (implemented); Apple Sign-In, Google Sign-In planned
- **Maps:** `expo-location` + `react-native-maps` (to be added)
- **Media:** `expo-image-picker`
- **Notifications:** `expo-notifications`

## Key Architecture Decisions

- **Arabic-first, RTL by default** — design layouts to work in RTL; English is secondary
- **Supabase Realtime** powers live map tracking, chat messages, and quote/status updates
- **Row Level Security (RLS)** policies enforce data access at the database level
- **Negative Wallet system** for cash payments: platform commission is deducted from the technician's virtual wallet balance; accounts exceeding -200 SAR threshold are suspended
- **Commission model:** 10% on completed jobs
- **Service request statuses:** pending → quote_received → inspection_scheduled → accepted → in_progress → completed → cancelled

## Data Model (Supabase/PostgreSQL)

Core tables: `users`/`profiles`, `service_requests`, `quotes`, `messages`, `payments`, `reviews`. See `RepairDriver.md` Section 6 for full schema definitions including column types and enums.

Key relationships:
- `quotes` reference both `service_requests` and `technician_id`
- `quotes.is_inspection_request` distinguishes inspection requests (with fee) from direct quotes
- `messages` are scoped to a `request_id` for per-request chat threads
- `payments.commission_amount` tracks the platform's cut per transaction

## Business Rules

- Cancellation fee applies if customer cancels after technician status is "On the way"
- Technicians provide 14-30 day workmanship warranty on completed jobs
- Target response time for immediate requests: under 60 minutes
- Frequent technician cancellations result in rating drops and account penalties
