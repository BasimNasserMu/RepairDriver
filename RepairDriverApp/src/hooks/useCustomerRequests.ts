import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { cancelServiceRequest } from "../lib/requests";
import { useAuth } from "../contexts/AuthContext";
import type { Assignment, Profile, ServiceRequest } from "../types/database";

export type RequestTechnician = Pick<Profile, "id" | "full_name">;

export interface CustomerRequestItem {
  request: ServiceRequest;
  /** Technician on a pending or confirmed assignment, if any. */
  technician: RequestTechnician | null;
}

/** Live list of the signed-in customer's service requests, newest first. */
export function useCustomerRequests() {
  const { user } = useAuth();
  const [items, setItems] = useState<CustomerRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);

    try {
      const { data: requests, error: rErr } = await supabase
        .from("service_requests")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      if (rErr) throw rErr;

      const rows = (requests ?? []) as ServiceRequest[];
      const requestIds = rows.map((r) => r.id);

      let technicianByRequest = new Map<string, RequestTechnician>();
      if (requestIds.length > 0) {
        const { data: assignments, error: aErr } = await supabase
          .from("assignments")
          .select("request_id, technician_id, status")
          .in("request_id", requestIds)
          .in("status", ["pending", "confirmed"]);
        if (aErr) throw aErr;

        const assignmentRows = (assignments ?? []) as Pick<
          Assignment,
          "request_id" | "technician_id" | "status"
        >[];
        const technicianIds = [...new Set(assignmentRows.map((a) => a.technician_id))];

        if (technicianIds.length > 0) {
          const { data: technicians, error: tErr } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", technicianIds);
          if (tErr) throw tErr;
          const byId = new Map(
            ((technicians ?? []) as RequestTechnician[]).map((t) => [t.id, t])
          );
          technicianByRequest = new Map(
            assignmentRows
              .filter((a) => byId.has(a.technician_id))
              .map((a) => [a.request_id, byId.get(a.technician_id)!])
          );
        }
      }

      setItems(
        rows.map((request) => ({
          request,
          technician: technicianByRequest.get(request.id) ?? null,
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    load();

    // Status/price changes on own requests, and technician assignments
    // (RLS limits assignment events to the customer's own requests).
    const channel = supabase
      .channel(`customer-requests:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_requests",
          filter: `customer_id=eq.${user.id}`,
        },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assignments" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const cancel = useCallback(
    async (requestId: string) => {
      await cancelServiceRequest(requestId);
      await load();
    },
    [load]
  );

  const active = items.filter(
    (i) => i.request.status !== "completed" && i.request.status !== "cancelled"
  );

  return { items, active, loading, refreshing, error, refresh, cancel };
}
