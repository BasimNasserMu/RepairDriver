import { supabase } from "./supabase";
import type { ServiceRequest, Urgency } from "../types/database";

export const REQUEST_PHOTOS_BUCKET = "request-photos";

export interface LocalPhoto {
  uri: string;
  mimeType?: string | null;
}

export interface RequestLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface NewServiceRequest {
  customerId: string;
  category: string;
  description: string;
  urgency: Urgency;
  photos: LocalPhoto[];
  location: RequestLocation;
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Uploads photos to `request-photos/<customerId>/…` and returns their object paths. */
async function uploadPhotos(customerId: string, photos: LocalPhoto[]): Promise<string[]> {
  const paths: string[] = [];
  try {
    for (const photo of photos) {
      const contentType = photo.mimeType && EXTENSIONS[photo.mimeType] ? photo.mimeType : "image/jpeg";
      const path = `${customerId}/${randomId()}.${EXTENSIONS[contentType]}`;
      const body = await (await fetch(photo.uri)).arrayBuffer();
      const { error } = await supabase.storage
        .from(REQUEST_PHOTOS_BUCKET)
        .upload(path, body, { contentType, upsert: false });
      if (error) throw error;
      paths.push(path);
    }
    return paths;
  } catch (e) {
    await removePhotos(paths);
    throw e;
  }
}

async function removePhotos(paths: string[]) {
  if (paths.length === 0) return;
  await supabase.storage.from(REQUEST_PHOTOS_BUCKET).remove(paths);
}

/**
 * Uploads photos, then inserts the request. Status/price are set server-side
 * (the DB forces `pending` and clears `assigned_price`). Uploaded photos are
 * removed again if the insert fails.
 */
export async function createServiceRequest(input: NewServiceRequest): Promise<ServiceRequest> {
  const photoPaths = await uploadPhotos(input.customerId, input.photos);

  const { data, error } = await supabase
    .from("service_requests")
    .insert({
      customer_id: input.customerId,
      category: input.category,
      description: input.description.trim(),
      urgency: input.urgency,
      photos: photoPaths,
      location_address: input.location.address,
      location_lat: input.location.lat,
      location_lng: input.location.lng,
    })
    .select()
    .single();

  if (error) {
    await removePhotos(photoPaths);
    throw error;
  }
  return data as ServiceRequest;
}

export async function cancelServiceRequest(requestId: string) {
  const { error } = await supabase
    .from("service_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId);
  if (error) throw error;
}

export function canCustomerCancel(request: Pick<ServiceRequest, "status">) {
  return request.status === "pending" || request.status === "confirmed";
}
