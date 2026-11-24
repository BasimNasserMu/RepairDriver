// Mirrors the Supabase schema (see supabase/migrations/).
// Model: admins assign technicians to requests; technicians confirm,
// start and complete jobs via RPC functions.

export type UserType = "customer" | "technician" | "admin";

export type ServiceRequestStatus =
  | "pending" // created by customer, awaiting admin assignment / technician confirmation
  | "confirmed" // technician confirmed the assignment
  | "in_progress" // technician started the job (start_job)
  | "completed" // technician completed the job (complete_job)
  | "cancelled";

export type AssignmentStatus = "pending" | "confirmed";

export type Urgency = "normal" | "emergency";

export type PaymentMethod = "cash" | "apple_pay" | "mada";

export type WalletTransactionType = "commission" | "cancellation_fee" | (string & {});

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  category: string;
  name: string;
  description: string;
  starting_price: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  service_id: string | null;
  category: string;
  description: string;
  photos: string[];
  urgency: Urgency;
  status: ServiceRequestStatus;
  location_address: string;
  location_lat: number;
  location_lng: number;
  /** Set by admin; customers cannot change it. */
  assigned_price: number | null;
  assigned_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  request_id: string;
  technician_id: string;
  status: AssignmentStatus;
  notes: string | null;
  assigned_by: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Message {
  id: string;
  request_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  request_id: string;
  amount: number;
  commission: number;
  method: PaymentMethod;
  paid_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  request_id: string;
  customer_id: string;
  technician_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface SavedLocation {
  id: string;
  customer_id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  is_default: boolean;
  created_at: string;
}

export interface TechnicianDocument {
  id: string;
  technician_id: string;
  type: string;
  url: string;
  verified: boolean;
  created_at: string;
}

export interface TechnicianLocation {
  technician_id: string;
  lat: number;
  lng: number;
  updated_at: string;
}

export interface Wallet {
  id: string;
  technician_id: string;
  balance: number;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  technician_id: string;
  type: WalletTransactionType;
  amount: number;
  description: string | null;
  created_at: string;
}

export interface Warranty {
  id: string;
  request_id: string;
  warranty_days: number;
  expires_at: string;
  created_at: string;
}

/** Return shape of the complete_job / apply_cancellation_fee RPCs. */
export interface WalletChargeResult {
  success: boolean;
  new_balance: number;
  suspended: boolean;
  amount?: number;
  commission?: number;
  fee?: number;
}
