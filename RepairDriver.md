# Product Requirements Document (PRD)

**Project Name:** Repair Driver App - Home Maintenance Services
**Document Version:** 1.3
**Date:** November 24, 2026
**Author:** Basim Aldawood

> **v1.3 change:** The platform uses an **admin-assignment model**: the operations team prices each request and assigns a technician, instead of technicians bidding with quotes. Commission is **15%**. The data model (Section 6) now reflects the live Supabase schema.

## 1. Product Overview

### 1.1 Vision
A comprehensive digital platform aimed at connecting homeowners and facilities with professional maintenance service providers (electricians, plumbers, HVAC technicians, etc.). The app seeks to provide a seamless user experience that ensures quality, safety, and price transparency, while reducing the response time for immediate requests to less than 60 minutes.

### 1.2 Target Audience
* **End Users (Customers):** Individuals, families, and small office owners looking for quick and reliable maintenance solutions.
* **Service Providers (Technicians):** Independent technicians and certified small-to-medium maintenance companies.
* **Administration (Platform):** The operations team that prices requests, assigns technicians, controls quality, and manages financial collection.

### 1.3 Business Objectives
* **Digital Transformation:** Digitizing the traditional maintenance market.
* **Reliability:** Building a database of verified and user-rated technicians.
* **Speed:** Reducing the time from discovering the fault to the technician's arrival to under 60 minutes for immediate requests.
* **Price Consistency:** Prices are set by the platform, not negotiated per job.
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
* **Real-time:** Supabase Realtime (Live map tracking, chat messages, assignment and status updates).
* **Storage:** Supabase Storage (Damage photos, avatars, documents).
* **Security:** Row Level Security (RLS) policies. Privileged state changes (confirming, starting, completing jobs; wallet charges) happen only through `SECURITY DEFINER` RPC functions.

---

## 3. Core Features

### Epic 1: Customer App
* **Feature 1.1 Registration & Login:** Phone number with OTP verification.
* **Feature 1.2 Services List:** Browse service types with starting prices.
* **Feature 1.3 Smart Service Request:** Describe issue, attach multiple photos, set urgency (normal / emergency).
* **Feature 1.4 Location:** Pick the job location on a map; save frequent addresses (Home, Office).
* **Feature 1.5 Assignment & Price:** Get notified when the platform assigns a technician and sets the job price.
* **Feature 1.6 In-App Chat, Tracking & Notifications:** Real-time chat with the assigned technician, live tracking of their location while the job is active, and push notifications for status updates.
* **Feature 1.7 Cancellation & Warranty:** Cancel a request while it is pending or confirmed, and view the warranty issued on completed jobs.
* **Feature 1.8 Payment & Reviews:** Pay the assigned price (Cash at launch; Apple Pay/Mada later) and leave a 1-5 star rating for the technician.

### Epic 2: Technician App
* **Feature 2.1 Professional Profile:** Document uploads for admin verification.
* **Feature 2.2 Assignments Inbox:** Real-time notifications when the platform assigns a job; review details, price and location, then confirm.
* **Feature 2.3 Job Status Management:** Navigate to the customer, share live location, mark the job as started, and complete it (choosing the warranty period).
* **Feature 2.4 In-App Chat:** Communicate with the customer on confirmed jobs.
* **Feature 2.5 Wallet & Negative Balance Management:** Track earnings. On cash jobs, the platform's commission is deducted from the technician's virtual wallet (creating a negative balance). Accounts reaching the negative threshold (-200 SAR) are suspended until settled.

### Epic 3: Admin Dashboard (Web App)
* **Feature 3.1 Dispatch:** Review new requests, set the job price, and assign a technician.
* **Feature 3.2 User Management:** Verify technician documents, activate/block accounts.
* **Feature 3.3 Financial & Dispute Reports:** Track commissions, settle negative wallets, apply cancellation penalties, and resolve disputes.

---

## 4. User Journeys & Stories

### Customer Journey
1. **Request:** Selects "Plumbing", uploads 3 photos of a leak, picks the location, and submits.
2. **Assignment:** The platform sets the price (200 SAR) and assigns a technician. The customer is notified.
3. **Chat & Tracking:** The technician confirms. The customer chats with them and tracks their arrival on the map.
4. **Completion & Payment:** The technician completes the job. The customer pays 200 SAR in Cash and receives a 30-day warranty in the app.
5. **Review:** Leaves a 5-star review.

### Technician Journey
1. **Assignment:** Receives a push notification for an assigned plumbing job (200 SAR) and confirms it.
2. **Visit:** Drives to the location (sharing live location) and marks the job as started.
3. **Completion & Wallet:** Completes the job with a 30-day warranty. The customer pays 200 SAR in Cash. The platform deducts a 15% commission (30 SAR) from the technician's wallet, lowering their balance.

### Admin Journey
1. **Dispatch:** Sees the new plumbing request, sets the price to 200 SAR, and assigns an available verified plumber nearby.
2. **Monitoring:** Follows the request status; reassigns if the technician doesn't confirm in time.
3. **Finance:** Reviews wallets approaching -200 SAR and records settlements.

---

## 5. Business Logic & Policies
* **Request Lifecycle:** `pending` → (admin assigns + prices; technician confirms) → `confirmed` → `in_progress` → `completed`. A request can be `cancelled` by the customer while `pending` or `confirmed`.
* **Pricing:** Only admins set `assigned_price`. Customers and technicians cannot change it.
* **Cash Payments & Commission:** Commission is **15%** of the assigned price, deducted automatically from the technician's wallet when the job is completed. Technicians settle with the platform via bank transfer/payment gateway.
* **Suspension:** Wallets at or below **-200 SAR** are flagged for suspension until settled.
* **Cancellation Policy:** Technicians who cancel or no-show can be charged a cancellation penalty (default 25 SAR) by an admin, deducted from their wallet; frequent cancellations lower their rating and may lead to account penalties. A customer cancellation fee after the technician is "On the way" is planned but not yet implemented.
* **Warranty:** Technicians issue a warranty (typically 14 to 30 days) when completing a job; it is stored per request.

---

## 6. Data Model (Supabase Schema)

The source of truth is the SQL in `supabase/migrations/`. Summary:

### `profiles`
Linked 1:1 to `auth.users` and created automatically on signup.
* `id`, `full_name`, `phone`, `avatar_url`
* `role` (text: `customer` | `technician` | `admin`) — users may switch between customer and technician; only admins can grant `admin`
* `is_active` (boolean) — admin-controlled

### `services`
* `id`, `category`, `name`, `description`, `starting_price`, `is_active`, `display_order`

### `service_requests`
* `id`, `customer_id` (FK), `service_id` (FK), `category`
* `description`, `photos` (text[]), `urgency` (`normal` | `emergency`)
* `status` (`pending`, `confirmed`, `in_progress`, `completed`, `cancelled`)
* `location_address`, `location_lat`, `location_lng`
* `assigned_price` (numeric, admin-only), `assigned_by` (admin id)

### `assignments`
* `id`, `request_id` (FK), `technician_id` (FK), `assigned_by` (admin id), `notes`
* `status` (`pending` → `confirmed`)

### `messages` (In-App Chat)
* `id`, `request_id` (FK), `sender_id` (FK → profiles), `content`, `read_at`, `created_at`

### `payments`
* `id`, `request_id` (FK), `amount`, `commission`, `method` (`cash` | `apple_pay` | `mada`), `paid_at`
* Written only by `complete_job()`.

### `reviews`
* `id`, `request_id`, `customer_id`, `technician_id`, `rating` (1-5), `comment`
* Only the request's customer can review, only once completed, only the confirmed technician.

### `wallet` & `wallet_transactions`
* `wallet`: one per technician (`technician_id`, `balance`), created automatically.
* `wallet_transactions`: `type` (`commission`, `cancellation_fee`, …), `amount` (negative = charge), `description`.

### `warranties`
* `request_id` (unique), `warranty_days`, `expires_at`

### `saved_locations`, `technician_documents`, `technician_locations`
* Saved customer addresses; technician verification documents (`verified` set by admins only); latest technician GPS position (visible to the customer only during an active job).

### RPC functions
| Function | Caller | Effect |
|---|---|---|
| `confirm_assignment(assignment_id, technician_id)` | Assigned technician | Assignment + request → `confirmed` |
| `start_job(request_id)` | Confirmed technician | Request → `in_progress` |
| `complete_job(request_id, technician_id, warranty_days)` | Confirmed technician | Request → `completed`, records payment, deducts 15% commission, issues warranty |
| `apply_cancellation_fee(request_id, technician_id, fee)` | Admin | Deducts penalty from technician wallet |

---

## 7. MVP Development Milestones (10-Week Plan)

* **Phase 1: Foundation (Weeks 1-2)**
  * Expo & Supabase setup. DB Schema deployment. OTP Auth.
* **Phase 2: Core UIs & Profiles (Weeks 3-4)**
  * Customer Request Form & Maps. Technician Assignments Inbox.
* **Phase 3: Realtime Operations & Chat (Weeks 5-7)**
  * Implementing Supabase Realtime for assignments, status updates, live location tracking, and In-App Chat.
  * Integration of Expo Push Notifications.
* **Phase 4: Wallet, Cash Logic & Admin (Weeks 8-9)**
  * Implement Cash payment flow and Negative Wallet logic.
  * Build the Admin Dashboard for dispatch (pricing + assignment), monitoring requests, and verifying technicians.
  * *(Note: Complex digital payment gateways like Mada/Apple Pay can be integrated here if business registrations are ready, or shifted to post-MVP updates).*
* **Phase 5: Testing & MVP Launch (Week 10)**
  * End-to-End testing. Store submissions via EAS Build.
