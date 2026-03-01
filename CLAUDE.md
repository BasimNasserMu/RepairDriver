# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RepairDriver is a home maintenance services marketplace connecting homeowners with professional technicians (electricians, plumbers, HVAC, etc.). The project is currently in the PRD phase (`RepairDriver.md`); no code has been written yet.

The platform consists of three applications:
1. **Customer App** (mobile) - Request services, track technicians, chat, pay, review
2. **Technician App** (mobile) - Professional profiles, request radar, quoting/inspection workflow, wallet
3. **Admin Dashboard** (web) - User verification, financial reports, dispute resolution

## Technology Stack

- **Frontend:** Expo (React Native) with Expo Router for navigation
- **Styling:** NativeWind (Tailwind CSS) — Primary: `#231a73`, Secondary: `#eeeeee`
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Auth:** Phone OTP, Apple Sign-In, Google Sign-In via Supabase Auth
- **Maps:** `expo-location` + `react-native-maps`
- **Media:** `expo-image-picker`
- **Notifications:** `expo-notifications`

## Key Architecture Decisions

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
