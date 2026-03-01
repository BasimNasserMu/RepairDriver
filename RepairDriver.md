# Product Requirements Document (PRD)

**Project Name:** Repair Driver App - Home Maintenance Services
**Document Version:** 1.2
**Date:** March 1, 2026
**Author:** Basim Aldawood

## 1. Product Overview

### 1.1 Vision
A comprehensive digital platform aimed at connecting homeowners and facilities with professional maintenance service providers (electricians, plumbers, HVAC technicians, etc.). The app seeks to provide a seamless user experience that ensures quality, safety, and price transparency, while reducing the response time for immediate requests to less than 60 minutes.

### 1.2 Target Audience
* **End Users (Customers):** Individuals, families, and small office owners looking for quick and reliable maintenance solutions.
* **Service Providers (Technicians):** Independent technicians and certified small-to-medium maintenance companies.
* **Administration (Platform):** The team responsible for managing operations, quality control, and financial collection.

### 1.3 Business Objectives
* **Digital Transformation:** Digitizing the traditional maintenance market.
* **Reliability:** Building a database of verified and user-rated technicians.
* **Speed:** Reducing the time from discovering the fault to the technician's arrival to under 60 minutes for immediate requests.
* **Profitability:** Generating revenue through a commission system on successful operations.

---

## 2. Technology Stack & Architecture

### 2.1 Frontend: Expo (React Native)
* **Framework:** Expo to support both iOS and Android from a single codebase.
* **Routing:** Expo Router for managing navigation between app screens.
* **Styling & Theming:** NativeWind (Tailwind CSS) for modern and responsive UI, configured with the app's brand colors:
  * **Primary Color:** `#231a73` (Used for branding, main buttons, headers, and active states).
  * **Secondary Color:** `#eeeeee` (Used for app backgrounds, cards, and secondary elements).
* **Maps & Location:** `expo-location` and `react-native-maps` to pinpoint locations.
* **Camera & Files:** `expo-image-picker` to upload photos.
* **Notifications:** `expo-notifications` for push notifications (critical for offline alerts).

### 2.2 Backend: Supabase
* **Database:** PostgreSQL.
* **Authentication:** Supabase Auth (Phone Number OTP, Apple/Google).
* **Real-time:** Supabase Realtime (Live map tracking, chat messages, quote updates).
* **Storage:** Supabase Storage (Damage photos, avatars, documents).
* **Security:** Row Level Security (RLS) policies.

---

## 3. Core Features

### Epic 1: Customer App
* **Feature 1.1 Registration & Login:** Phone number with OTP verification.
* **Feature 1.2 Services List:** Browse and select service types.
* **Feature 1.3 Smart Service Request:** Describe issue, attach multiple photos, set urgency.
* **Feature 1.4 Location Tracking:** Google Maps integration.
* **Feature 1.5 Receive Quotes & Inspections:** Review quotes or "Inspection Requests".
* **Feature 1.6 In-App Chat & Notifications:** Real-time chat with the technician before arrival and push notifications for status updates.
* **Feature 1.7 Cancellation & Warranty:** Ability to cancel requests (subject to policy) and view post-service warranties (e.g., 30-day guarantee on fixes).
* **Feature 1.8 Payment & Reviews:** Pay via Apple Pay/Mada/Cash and leave a 1-5 star rating.

### Epic 2: Technician App
* **Feature 2.1 Professional Profile:** Document uploads for admin verification.
* **Feature 2.2 Request Radar:** Real-time notifications for nearby requests.
* **Feature 2.3 Quoting, Inspection & Final Bidding:** Send a direct quote, OR request an inspection (with optional fee). *Crucially: After an inspection, the technician can submit a "Final Repair Quote" for the customer to approve.*
* **Feature 2.4 Navigation & Status Management:** Map routing to customer and status updates.
* **Feature 2.5 In-App Chat:** Communicate with customers to clarify issues.
* **Feature 2.6 Wallet & Negative Balance Management:** Track earnings. If a customer pays in Cash, the app's commission is deducted from the technician's virtual wallet (creating a negative balance). Accounts exceeding a negative threshold (e.g., -200 SAR) are temporarily suspended until settled.

### Epic 3: Admin Dashboard (Web App)
* **Feature 3.1 User Management:** Verify documents, activate/block accounts.
* **Feature 3.2 Financial & Dispute Reports:** Track commissions, settle negative wallets, and resolve cancellation disputes.

---

## 4. User Journeys & Stories

### Customer Journey
1. **Request:** Selects "Plumbing", uploads 3 photos of a leak, and requests help.
2. **Quotes/Inspection:** Receives an Inspection Request (50 SAR fee). Accepts it.
3. **Chat & Tracking:** Chats with the technician via the app, then tracks their arrival on the map.
4. **Final Quote & Payment:** Technician inspects, sends a Final Quote (200 SAR). Customer approves, pays Cash, and receives a 30-day warranty receipt in the app.
5. **Review:** Leaves a 5-star review.

### Technician Journey
1. **Radar & Inspection:** Receives request, sends Inspection Request (50 SAR).
2. **Visit & Final Quote:** Drives to the location, inspects the leak, sends a Final Quote (200 SAR total).
3. **Completion & Wallet:** Completes the job. Customer pays 200 SAR in Cash. The platform deducts a 10% commission (20 SAR) from the technician's digital wallet, lowering their balance.

---

## 5. Business Logic & Policies
* **Cash Payments & Commission:** To handle cash payments, the platform utilizes a "Negative Wallet" system. Commission is automatically deducted from the technician's in-app balance. Technicians must pay the platform via bank transfer/payment gateway when their balance reaches the allowed negative limit.
* **Cancellation Policy:** If a customer cancels after the technician is "On the way", a cancellation fee may apply. If the technician cancels frequently, their rating drops and account may be penalized.
* **Warranty:** Approved technicians must provide a standard warranty (e.g., 14 to 30 days) on their workmanship to increase customer trust.

---

## 6. Data Model (Expanded Supabase Schema)

### `users` & `profiles`
* Managed by `auth.users` with linked `profiles` table (`user_type`, `avatar_url`, `is_verified`).

### `service_requests`
* `id` (uuid)
* `customer_id` (uuid, FK)
* `service_id` (uuid, FK)
* `description` (text)
* `images_urls` (array of text) - *Multiple photos*
* `status` (enum: pending, quote_received, inspection_scheduled, accepted, in_progress, completed, cancelled)
* `cancellation_reason` (text)
* `warranty_days` (integer) - *e.g., 30*

### `quotes`
* `id` (uuid)
* `request_id` (uuid, FK)
* `technician_id` (uuid, FK)
* `is_inspection_request` (boolean)
* `inspection_fee` (numeric)
* `price` (numeric) - *Final repair price*
* `status` (enum: pending, accepted, rejected)

### `messages` (In-App Chat)
* `id` (uuid)
* `request_id` (uuid, FK)
* `sender_id` (uuid, FK -> profiles.id)
* `content` (text)
* `created_at` (timestamp)

### `payments`
* `id` (uuid)
* `request_id` (uuid, FK)
* `amount` (numeric)
* `payment_method` (enum: 'cash', 'apple_pay', 'mada')
* `status` (enum: 'pending', 'completed', 'failed')
* `commission_amount` (numeric)

### `reviews`
* `id` (uuid)
* `request_id` (uuid, FK)
* `customer_id` (uuid, FK)
* `technician_id` (uuid, FK)
* `rating` (integer, 1-5)
* `comment` (text)

---

## 7. MVP Development Milestones (10-Week Plan)

* **Phase 1: Foundation (Weeks 1-2)**
  * Expo & Supabase setup. DB Schema deployment. OTP Auth.
* **Phase 2: Core UIs & Profiles (Weeks 3-4)**
  * Customer Request Form & Maps. Technician Radar.
* **Phase 3: Realtime Operations & Chat (Weeks 5-7)**
  * Implementing Supabase Realtime for quotes, inspection flows, live location tracking, and In-App Chat.
  * Integration of Expo Push Notifications.
* **Phase 4: Wallet, Cash Logic & Admin (Weeks 8-9)**
  * Implement Cash payment flow and Negative Wallet logic.
  * Build basic Admin Dashboard to monitor requests and verify techs.
  * *(Note: Complex digital payment gateways like Mada/Apple Pay can be integrated here if business registrations are ready, or shifted to post-MVP updates).*
* **Phase 5: Testing & MVP Launch (Week 10)**
  * End-to-End testing. Store submissions via EAS Build.