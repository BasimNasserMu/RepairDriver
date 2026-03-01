export type UserType = "customer" | "technician" | "admin";

export type ServiceRequestStatus =
  | "pending"
  | "quote_received"
  | "inspection_scheduled"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type QuoteStatus = "pending" | "accepted" | "rejected";

export type PaymentMethod = "cash" | "apple_pay" | "mada";

export type PaymentStatus = "pending" | "completed" | "failed";

export interface Profile {
  id: string;
  user_type: UserType;
  full_name: string;
  phone: string;
  email?: string;
  avatar_url?: string;
  is_verified: boolean;
  rating?: number;
  completed_jobs?: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name_ar: string;
  name_en: string;
  icon: string;
  is_active: boolean;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  service_id: string;
  description: string;
  images_urls: string[];
  status: ServiceRequestStatus;
  urgency: "normal" | "emergency";
  latitude?: number;
  longitude?: number;
  address?: string;
  cancellation_reason?: string;
  warranty_days?: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  service?: ServiceCategory;
  customer?: Profile;
  quotes?: Quote[];
}

export interface Quote {
  id: string;
  request_id: string;
  technician_id: string;
  is_inspection_request: boolean;
  inspection_fee?: number;
  price?: number;
  status: QuoteStatus;
  notes?: string;
  created_at: string;
  // Joined fields
  technician?: Profile;
}

export interface Message {
  id: string;
  request_id: string;
  sender_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  // Joined fields
  sender?: Profile;
}

export interface Payment {
  id: string;
  request_id: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  commission_amount: number;
  created_at: string;
}

export interface Review {
  id: string;
  request_id: string;
  customer_id: string;
  technician_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  // Joined fields
  customer?: Profile;
}

export interface WalletTransaction {
  id: string;
  technician_id: string;
  amount: number;
  type: "earning" | "commission" | "top_up" | "settlement";
  description: string;
  reference_id?: string;
  created_at: string;
}
