# RepairDriver — ريبير درايفر

A home maintenance services platform connecting homeowners in Saudi Arabia with verified professional technicians — electricians, plumbers, HVAC, painters, carpenters, and more. The app is Arabic-first with full RTL support, and English is also available.

## Features

**Customer app**
- Request a service with a description, photos, and location
- The platform prices each request and assigns a verified technician
- Track the technician live on a map and chat for each request
- Pay and leave a review; completed jobs carry a 14–30 day workmanship warranty

**Technician app**
- Assignments inbox: receive and confirm jobs assigned by the platform
- Start and complete jobs, issue a warranty
- Wallet and earnings, with a negative-balance system for cash jobs (15% platform commission; wallets at −200 SAR are suspended)

**Admin dashboard** (planned): dispatch (pricing and assigning technicians), user verification, financial reports, dispute resolution

## Tech Stack

- [Expo](https://expo.dev) (React Native) + Expo Router, TypeScript
- [NativeWind](https://www.nativewind.dev) (Tailwind CSS)
- [Supabase](https://supabase.com): PostgreSQL, Auth (phone OTP), Realtime, Storage
- i18next for Arabic and English

## Repository Structure

```
RepairDriver.md      Product requirements document (PRD) and data schema
ProposedScreens/     HTML/PNG design mockups for key screens
supabase/migrations/ Database migrations (SQL)
RepairDriverApp/     Expo mobile app (customer + technician)
  app/               Routes: auth/, customer/, technician/
  src/components/    Shared UI components
  src/contexts/      Auth context (Supabase session and profile)
  src/i18n/          Arabic and English translations
  src/lib/           Supabase client and app constants
  src/types/         Database types
```

## Getting Started

Prerequisites: Node.js (LTS), a Supabase project, and Expo Go or an iOS/Android simulator.

```bash
cd RepairDriverApp
npm install
cp .env.example .env
# Edit .env and set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
npm start
```

Then press `a` (Android), `i` (iOS), or `w` (web), or scan the QR code with Expo Go.

## Status

Early development. The app shell, authentication flow, navigation, UI components, and translations are in place. Most screens still show placeholder data. Next up: the technician assignments inbox, wiring screens to Supabase, realtime chat and tracking, maps, and the admin dashboard.
