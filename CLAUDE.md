# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RepairDriver is a home maintenance services platform connecting homeowners with professional technicians (electricians, plumbers, HVAC, etc.), targeting the Saudi market (SAR currency, Arabic-first UI).

**Business model: admin assignment.** Customers submit requests; the operations team (admin) sets the price and assigns a technician; the technician confirms, starts and completes the job. There are **no quotes or technician bidding**.

The platform consists of three applications:
1. **Customer App** (mobile) - Request services, track technicians, chat, pay, review
2. **Technician App** (mobile) - Professional profile, assignments inbox, job status (confirm/start/complete), wallet
3. **Admin Dashboard** (web) - Dispatch (pricing + assigning technicians), user verification, financial reports, disputes — **not started**

## Repository Layout

- `RepairDriver.md` — Product requirements (PRD), including the data model summary (Section 6)
- `supabase/migrations/` — SQL migrations; the source of truth for the database. The baseline schema was created in the Supabase dashboard and is not in the repo yet; migrations here apply on top of it
- `ProposedScreens/` — HTML + PNG design mockups for key screens; use as visual reference when building UI
- `RepairDriverApp/` — Expo app containing both the customer and technician experiences

## Current Status

The mobile app is an early scaffold:
- Routing, auth flow, layouts, UI components, and i18n are in place
- Only auth/profile logic (`src/contexts/AuthContext.tsx`) talks to Supabase; customer/technician screens render static placeholder data
- The technician home screen (`app/technician/index.tsx`) is still the old quote/inspection "radar" UI and must be rebuilt as an assignments inbox
- Not yet implemented: Realtime chat & tracking, maps (`react-native-maps` is not installed yet), payments, reviews, push notifications, Apple/Google sign-in, admin dashboard

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
  - `app/technician/` — tabs: `index` (to become assignments inbox), `jobs`, `wallet`, `profile`
- **`src/contexts/AuthContext.tsx`** — Supabase session, `profiles` fetch, phone OTP sign-in, user type; consume via `useAuth()`
- **`src/lib/supabase.ts`** — Supabase client (AsyncStorage session persistence), configured via `EXPO_PUBLIC_*` env vars
- **`src/lib/constants.ts`** — color palette, `COMMISSION_RATE` (must match `complete_job()` in the DB), `NEGATIVE_WALLET_LIMIT`, `DEFAULT_WARRANTY_DAYS`, `MAX_PHOTOS`, service icons. Use these instead of hard-coding business values
- **`src/types/database.ts`** — TypeScript types mirroring the DB schema; keep in sync with `supabase/migrations/`. Profiles use `role` (not `user_type`)
- **`src/components/ui/`** — shared `Button`, `Card`, `Input`, `EmptyState`, `ServiceIcon`, `StatusBadge`
- **i18n (`src/i18n/`)** — i18next with `ar` (default + fallback) and `en`. All user-facing strings go in **both** `ar.ts` and `en.ts`. `src/hooks/useRTL.ts` toggles RTL via `I18nManager` based on language

## Technology Stack

- **Frontend:** Expo SDK 58, React Native 0.88, React 19.3, TypeScript 6, Expo Router
- **Styling:** NativeWind v4 (Tailwind CSS 3) — Primary: `#231a73`, Secondary: `#eeeeee` (see `tailwind.config.js`)
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Auth:** Phone OTP (implemented); Apple Sign-In, Google Sign-In planned
- **Maps:** `expo-location` + `react-native-maps` (to be added)
- **Media:** `expo-image-picker`
- **Notifications:** `expo-notifications`

## Key Architecture Decisions

- **Arabic-first, RTL by default** — design layouts to work in RTL; English is secondary
- **Supabase Realtime** powers live map tracking, chat messages, and assignment/status updates
- **Row Level Security (RLS)** policies enforce data access at the database level. Policies must not query other RLS-protected tables directly (this caused infinite recursion); use the `SECURITY DEFINER` helpers instead: `is_admin()`, `is_request_customer()`, `is_assigned_technician()`, `shares_request_with()`, `can_view_technician_location()`, `can_review()`
- **Privileged state changes go through RPC functions**, not direct table writes: `confirm_assignment`, `start_job`, `complete_job` (technician), `apply_cancellation_fee` (admin). Call them with `supabase.rpc(...)`. RPCs must check `auth.uid() IS DISTINCT FROM ...` (not `!=`, which is NULL-unsafe) and `set search_path = public`
- **Column guards** (triggers `guard_profile_fields`, `guard_service_request_fields`) stop users changing `role`→admin, `is_active`, `assigned_price`, or request status (customers may only cancel). Profiles are created by the `on_auth_user_created` trigger, so the app updates them, never inserts
- **Negative Wallet system** for cash payments: platform commission is deducted from the technician's virtual wallet balance; wallets at or below -200 SAR are flagged for suspension
- **Commission model:** 15% of `assigned_price` on completed jobs (set in `complete_job()`)
- **Service request statuses:** pending → confirmed → in_progress → completed; customers can cancel while pending/confirmed. Assignment statuses: pending → confirmed

## Data Model (Supabase/PostgreSQL)

Tables: `profiles`, `services`, `service_requests`, `assignments`, `messages`, `payments`, `reviews`, `wallet`, `wallet_transactions`, `warranties`, `saved_locations`, `technician_documents`, `technician_locations`. See `RepairDriver.md` Section 6.

Key relationships:
- `assignments` link a `service_requests` row to a technician (created by an admin); the request price lives on `service_requests.assigned_price`
- `messages` are scoped to a `request_id`; only the customer, the confirmed technician and admins can read/send
- `payments` (`amount`, `commission`, `method`) are written only by `complete_job()`
- `wallet` is one row per technician, auto-created when a profile becomes a technician; `wallet_transactions` log each charge

## Testing database changes

There is no Supabase CLI link yet. To test a migration, run it against a throwaway local Postgres with mocked `auth.uid()`/`auth.role()`, `anon`/`authenticated` roles and a copy of the current schema, then exercise policies with `set role authenticated` + `set_config(request.jwt.claim.sub, ...)`. Apply to the live project via the dashboard SQL editor.

## Business Rules

- Admins can charge technicians a cancellation penalty (default 25 SAR) via `apply_cancellation_fee`; a customer cancellation fee after "On the way" is planned, not implemented
- Technicians provide 14-30 day workmanship warranty, recorded in `warranties` by `complete_job()`
- Target response time for immediate requests: under 60 minutes
- Frequent technician cancellations result in rating drops and account penalties
