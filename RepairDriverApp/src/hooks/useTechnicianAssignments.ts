import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type {
  Assignment,
  Profile,
  ServiceRequest,
  WalletChargeResult,
} from "../types/database";

export type AssignmentCustomer = Pick<Profile, "id" | "full_name" | "phone">;

export interface AssignmentItem {
  assignment: Assignment;
  request: ServiceRequest;
  customer: AssignmentCustomer | null;
}

/**
 * Live list of the signed-in technician's open assignments:
 * - pending: waiting for the technician to confirm
 * - confirmed: request is confirmed or in progress
 * Finished/cancelled requests are excluded (they belong in job history).
 */
export function useTechnicianAssignments() {
  const { user } = useAuth();
  const [items, setItems] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);

    try {
      // Separate queries instead of PostgREST embeds so this doesn't depend
      // on which foreign keys exist in the database.
      const { data: assignments, error: aErr } = await supabase
        .from("assignments")
        .select("*")
        .eq("technician_id", user.id)
        .in("status", ["pending", "confirmed"])
        .order("created_at", { ascending: false });
      if (aErr) throw aErr;

      const rows = (assignments ?? []) as Assignment[];
      const requestIds = [...new Set(rows.map((a) => a.request_id))];
      if (requestIds.length === 0) {
        setItems([]);
        return;
      }

      const { data: requests, error: rErr } = await supabase
        .from("service_requests")
        .select("*")
        .in("id", requestIds);
      if (rErr) throw rErr;
      const requestById = new Map(
        ((requests ?? []) as ServiceRequest[]).map((r) => [r.id, r])
      );

      const customerIds = [
        ...new Set([...requestById.values()].map((r) => r.customer_id)),
      ];
      const { data: customers, error: cErr } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", customerIds);
      if (cErr) throw cErr;
      const customerById = new Map(
        ((customers ?? []) as AssignmentCustomer[]).map((c) => [c.id, c])
      );

      const next: AssignmentItem[] = [];
      for (const assignment of rows) {
        const request = requestById.get(assignment.request_id);
        if (!request) continue;
        if (request.status === "completed" || request.status === "cancelled") continue;
        next.push({
          assignment,
          request,
          customer: customerById.get(request.customer_id) ?? null,
        });
      }
      setItems(next);
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

    // Reload when an admin assigns/unassigns this technician.
    // Requires `assignments` to be in the supabase_realtime publication;
    // pull-to-refresh still works without it.
    const channel = supabase
      .channel(`technician-assignments:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assignments",
          filter: `technician_id=eq.${user.id}`,
        },
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

  const confirm = useCallback(
    async (assignmentId: string) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.rpc("confirm_assignment", {
        p_assignment_id: assignmentId,
        p_technician_id: user.id,
      });
      if (error) throw error;
      await load();
    },
    [user, load]
  );

  const start = useCallback(
    async (requestId: string) => {
      const { error } = await supabase.rpc("start_job", {
        p_request_id: requestId,
      });
      if (error) throw error;
      await load();
    },
    [load]
  );

  const complete = useCallback(
    async (requestId: string, warrantyDays: number): Promise<WalletChargeResult> => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase.rpc("complete_job", {
        p_request_id: requestId,
        p_technician_id: user.id,
        p_warranty_days: warrantyDays,
      });
      if (error) throw error;
      await load();
      return data as WalletChargeResult;
    },
    [user, load]
  );

  const pending = items.filter((i) => i.assignment.status === "pending");
  const active = items.filter((i) => i.assignment.status === "confirmed");

  return { pending, active, loading, refreshing, error, refresh, confirm, start, complete };
}
