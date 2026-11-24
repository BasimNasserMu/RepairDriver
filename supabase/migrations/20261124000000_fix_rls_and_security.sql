-- =============================================================================
-- Fix RLS infinite recursion and security holes in the existing schema.
--
-- Model: admins assign technicians to service requests (`assignments`);
-- technicians confirm, start and complete jobs through RPC functions.
--
-- What this migration does
--   1. Adds SECURITY DEFINER helper functions so policies no longer query each
--      other's tables (fixes "infinite recursion detected in policy").
--   2. Rebuilds every RLS policy on the affected tables using those helpers.
--   3. Blocks privilege escalation: users can no longer make themselves admin,
--      reactivate themselves, verify their own documents, or edit prices.
--   4. Fixes payments policies that exposed every payment to every technician.
--   5. Restricts profile visibility (phone numbers) to self, admins and the
--      other party on a shared request.
--   6. Hardens RPC functions: NULL-safe auth checks, admin-only cancellation
--      fee, pinned search_path, no EXECUTE for anon.
--   7. Adds start_job() so technicians can move a job to in_progress.
--
-- Safe to re-run.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Helper functions (SECURITY DEFINER: bypass RLS, so no policy recursion)
-- -----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

-- Referenced a non-existent profiles.user_type column; superseded by is_admin().
drop function if exists public.current_user_type();

create or replace function public.is_request_customer(p_request_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.service_requests
    where id = p_request_id and customer_id = auth.uid()
  );
$$;

create or replace function public.is_assigned_technician(
  p_request_id uuid,
  p_confirmed_only boolean default true
)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.assignments
    where request_id = p_request_id
      and technician_id = auth.uid()
      and (not p_confirmed_only or status = 'confirmed')
  );
$$;

-- True when the caller and p_profile_id are the customer/technician pair on a
-- live assignment. Used to let each side see the other's profile.
create or replace function public.shares_request_with(p_profile_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assignments a
    join public.service_requests sr on sr.id = a.request_id
    where a.status in ('pending', 'confirmed')
      and (
        (sr.customer_id = auth.uid() and a.technician_id = p_profile_id)
        or (a.technician_id = auth.uid() and sr.customer_id = p_profile_id)
      )
  );
$$;

create or replace function public.can_view_technician_location(p_technician_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assignments a
    join public.service_requests sr on sr.id = a.request_id
    where a.technician_id = p_technician_id
      and a.status = 'confirmed'
      and sr.customer_id = auth.uid()
      and sr.status in ('confirmed', 'in_progress')
  );
$$;

create or replace function public.can_review(p_request_id uuid, p_technician_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.service_requests sr
    join public.assignments a on a.request_id = sr.id
    where sr.id = p_request_id
      and sr.customer_id = auth.uid()
      and sr.status = 'completed'
      and a.technician_id = p_technician_id
      and a.status = 'confirmed'
  );
$$;

-- -----------------------------------------------------------------------------
-- 2. Drop every existing policy on the affected tables
-- -----------------------------------------------------------------------------

do $$
declare
  r record;
begin
  for r in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'assignments', 'messages', 'payments', 'profiles', 'reviews',
        'service_requests', 'technician_documents', 'technician_locations',
        'wallet', 'wallet_transactions', 'warranties'
      )
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3. Recreate policies
-- -----------------------------------------------------------------------------

-- profiles --------------------------------------------------------------------
create policy "Profiles visible to self, admins and request counterpart"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin() or public.shares_request_with(id));

create policy "Users can insert own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid() and role in ('customer', 'technician'));

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Admins can update any profile"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- service_requests ------------------------------------------------------------
create policy "Requests visible to owner, assigned technician and admins"
  on public.service_requests for select to authenticated
  using (
    customer_id = auth.uid()
    or public.is_admin()
    or public.is_assigned_technician(id, false)
  );

create policy "Customers can create requests"
  on public.service_requests for insert to authenticated
  with check (customer_id = auth.uid());

create policy "Customers can update own requests"
  on public.service_requests for update to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

create policy "Admins can update all requests"
  on public.service_requests for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- assignments -----------------------------------------------------------------
-- Technicians change assignment state only via confirm_assignment().
create policy "Assignments visible to technician, request owner and admins"
  on public.assignments for select to authenticated
  using (
    technician_id = auth.uid()
    or public.is_admin()
    or public.is_request_customer(request_id)
  );

create policy "Admins can manage assignments"
  on public.assignments for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- messages --------------------------------------------------------------------
create policy "Request participants can view messages"
  on public.messages for select to authenticated
  using (
    public.is_request_customer(request_id)
    or public.is_assigned_technician(request_id)
    or public.is_admin()
  );

create policy "Request participants can send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and (
      public.is_request_customer(request_id)
      or public.is_assigned_technician(request_id)
      or public.is_admin()
    )
  );

-- payments --------------------------------------------------------------------
-- Payments are written by complete_job() only; no INSERT policy.
create policy "Payments visible to request participants and admins"
  on public.payments for select to authenticated
  using (
    public.is_request_customer(request_id)
    or public.is_assigned_technician(request_id)
    or public.is_admin()
  );

-- reviews ---------------------------------------------------------------------
create policy "Anyone can view reviews"
  on public.reviews for select
  using (true);

create policy "Customers can review the technician on their completed request"
  on public.reviews for insert to authenticated
  with check (
    customer_id = auth.uid()
    and public.can_review(request_id, technician_id)
  );

-- technician_documents --------------------------------------------------------
create policy "Technicians can view own documents"
  on public.technician_documents for select to authenticated
  using (technician_id = auth.uid() or public.is_admin());

create policy "Technicians can upload unverified documents"
  on public.technician_documents for insert to authenticated
  with check (technician_id = auth.uid() and verified = false);

create policy "Technicians can delete own unverified documents"
  on public.technician_documents for delete to authenticated
  using (technician_id = auth.uid() and verified = false);

create policy "Admins can manage documents"
  on public.technician_documents for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- technician_locations --------------------------------------------------------
create policy "Technicians can manage own location"
  on public.technician_locations for all to authenticated
  using (technician_id = auth.uid())
  with check (technician_id = auth.uid());

create policy "Customers can view their assigned technician's location"
  on public.technician_locations for select to authenticated
  using (public.can_view_technician_location(technician_id) or public.is_admin());

-- wallet / wallet_transactions ------------------------------------------------
create policy "Technicians can view own wallet"
  on public.wallet for select to authenticated
  using (technician_id = auth.uid() or public.is_admin());

create policy "Technicians can view own transactions"
  on public.wallet_transactions for select to authenticated
  using (technician_id = auth.uid() or public.is_admin());

-- warranties ------------------------------------------------------------------
create policy "Request participants can view warranties"
  on public.warranties for select to authenticated
  using (
    public.is_request_customer(request_id)
    or public.is_assigned_technician(request_id)
    or public.is_admin()
  );

-- -----------------------------------------------------------------------------
-- 4. Column-level guards (row-level policies can't restrict columns)
--
-- These triggers are SECURITY INVOKER on purpose: `current_user` is
-- 'authenticated' for direct API calls and the function owner when the write
-- comes from a SECURITY DEFINER function (complete_job etc.), which is trusted.
-- -----------------------------------------------------------------------------

create or replace function public.guard_profile_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user <> 'authenticated' or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.role not in ('customer', 'technician') then
      raise exception 'Invalid role: %', new.role;
    end if;
    new.is_active := true;
    return new;
  end if;

  -- Users may switch between customer and technician (onboarding), never to/from admin.
  if new.role is distinct from old.role
     and not (old.role in ('customer', 'technician') and new.role in ('customer', 'technician')) then
    raise exception 'Not allowed to change role';
  end if;

  if new.is_active is distinct from old.is_active then
    raise exception 'Not allowed to change account status';
  end if;

  if new.id is distinct from old.id then
    raise exception 'Not allowed to change id';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_fields on public.profiles;
create trigger guard_profile_fields
  before insert or update on public.profiles
  for each row execute function public.guard_profile_fields();

create or replace function public.guard_service_request_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user <> 'authenticated' or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.assigned_price := null;
    new.assigned_by := null;
    return new;
  end if;

  if new.customer_id is distinct from old.customer_id
     or new.assigned_price is distinct from old.assigned_price
     or new.assigned_by is distinct from old.assigned_by then
    raise exception 'Not allowed to change customer, price or assignment';
  end if;

  if new.status is distinct from old.status
     and not (new.status = 'cancelled' and old.status in ('pending', 'confirmed')) then
    raise exception 'Customers can only cancel pending or confirmed requests';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_service_request_fields on public.service_requests;
create trigger guard_service_request_fields
  before insert or update on public.service_requests
  for each row execute function public.guard_service_request_fields();

alter table public.service_requests
  drop constraint if exists service_requests_status_check;
alter table public.service_requests
  add constraint service_requests_status_check
  check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'))
  not valid;

-- -----------------------------------------------------------------------------
-- 5. Signup + wallet triggers
-- -----------------------------------------------------------------------------

-- Never trust the role in user metadata beyond customer/technician.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_role text := new.raw_user_meta_data ->> 'role';
begin
  if v_role is null or v_role not in ('customer', 'technician') then
    v_role := 'customer';
  end if;

  insert into public.profiles (id, full_name, phone, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'User'),
    new.phone,
    v_role,
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.create_technician_wallet()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if new.role = 'technician' then
    insert into public.wallet (technician_id) values (new.id)
    on conflict (technician_id) do nothing;
  end if;
  return new;
end;
$$;

-- Also fire when a user switches to technician during onboarding.
drop trigger if exists on_technician_profile_created on public.profiles;
create trigger on_technician_profile_created
  after insert or update of role on public.profiles
  for each row execute function public.create_technician_wallet();

-- -----------------------------------------------------------------------------
-- 6. RPC functions
--
-- Old checks used `auth.uid() != p_technician_id`, which is NULL (not true)
-- for anonymous callers, so the check was skipped. Use IS DISTINCT FROM.
-- -----------------------------------------------------------------------------

create or replace function public.confirm_assignment(p_assignment_id uuid, p_technician_id uuid)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_request_id uuid;
begin
  if auth.uid() is null or auth.uid() is distinct from p_technician_id then
    raise exception 'Unauthorized';
  end if;

  select request_id into v_request_id
  from public.assignments
  where id = p_assignment_id
    and technician_id = p_technician_id
    and status = 'pending';

  if v_request_id is null then
    raise exception 'Assignment not found or already processed';
  end if;

  update public.assignments set status = 'confirmed', updated_at = now() where id = p_assignment_id;
  update public.service_requests set status = 'confirmed', updated_at = now() where id = v_request_id;

  return jsonb_build_object('success', true, 'request_id', v_request_id);
end;
$$;

create or replace function public.start_job(p_request_id uuid)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.is_assigned_technician(p_request_id, true) then
    raise exception 'Unauthorized';
  end if;

  update public.service_requests
  set status = 'in_progress', updated_at = now()
  where id = p_request_id and status = 'confirmed';

  if not found then
    raise exception 'Request is not in a startable state';
  end if;

  return jsonb_build_object('success', true, 'request_id', p_request_id);
end;
$$;

create or replace function public.complete_job(
  p_request_id uuid,
  p_technician_id uuid,
  p_warranty_days integer default 0
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_commission       numeric;
  v_wallet_id        uuid;
  v_wallet_balance   numeric;
  v_warranty_expires timestamptz;
  v_assigned_price   numeric;
begin
  if auth.uid() is null or auth.uid() is distinct from p_technician_id then
    raise exception 'Unauthorized';
  end if;

  if not exists (
    select 1 from public.assignments
    where request_id = p_request_id
      and technician_id = p_technician_id
      and status = 'confirmed'
  ) then
    raise exception 'No confirmed assignment found for this technician on this request';
  end if;

  select assigned_price into v_assigned_price
  from public.service_requests
  where id = p_request_id and status in ('confirmed', 'in_progress')
  for update;

  if not found then
    raise exception 'Request is not in a completable state';
  end if;

  if v_assigned_price is null or v_assigned_price <= 0 then
    raise exception 'No assigned price set for this request';
  end if;

  if p_warranty_days < 0 or p_warranty_days > 365 then
    raise exception 'Invalid warranty period';
  end if;

  v_commission := round(v_assigned_price * 0.15, 2);

  select id into v_wallet_id from public.wallet where technician_id = p_technician_id;
  if v_wallet_id is null then
    raise exception 'Wallet not found for technician';
  end if;

  update public.service_requests set status = 'completed', updated_at = now() where id = p_request_id;

  insert into public.payments (request_id, amount, commission, method, paid_at)
  values (p_request_id, v_assigned_price, v_commission, 'cash', now());

  update public.wallet set balance = balance - v_commission, updated_at = now()
  where id = v_wallet_id
  returning balance into v_wallet_balance;

  insert into public.wallet_transactions (wallet_id, technician_id, type, amount, description)
  values (v_wallet_id, p_technician_id, 'commission', -v_commission,
          'Commission (15%) for job ' || p_request_id::text);

  if p_warranty_days > 0 then
    v_warranty_expires := now() + make_interval(days => p_warranty_days);
    insert into public.warranties (request_id, warranty_days, expires_at)
    values (p_request_id, p_warranty_days, v_warranty_expires)
    on conflict (request_id) do update
      set warranty_days = excluded.warranty_days, expires_at = excluded.expires_at;
  end if;

  return jsonb_build_object(
    'success', true,
    'amount', v_assigned_price,
    'commission', v_commission,
    'new_balance', v_wallet_balance,
    'suspended', v_wallet_balance <= -200
  );
end;
$$;

-- Penalty on the technician's wallet; admin-only.
create or replace function public.apply_cancellation_fee(
  p_request_id uuid,
  p_technician_id uuid,
  p_fee_amount numeric default 25
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_wallet_id      uuid;
  v_wallet_balance numeric;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;

  if p_fee_amount is null or p_fee_amount <= 0 then
    raise exception 'Invalid fee amount';
  end if;

  select id into v_wallet_id from public.wallet where technician_id = p_technician_id;
  if v_wallet_id is null then
    raise exception 'Wallet not found';
  end if;

  update public.wallet set balance = balance - p_fee_amount, updated_at = now()
  where id = v_wallet_id
  returning balance into v_wallet_balance;

  insert into public.wallet_transactions (wallet_id, technician_id, type, amount, description)
  values (v_wallet_id, p_technician_id, 'cancellation_fee', -p_fee_amount,
          'Cancellation fee for request ' || p_request_id::text);

  return jsonb_build_object(
    'success', true,
    'fee', p_fee_amount,
    'new_balance', v_wallet_balance,
    'suspended', v_wallet_balance <= -200
  );
end;
$$;

-- Pin search_path on the remaining trigger helpers.
alter function public.set_updated_at() set search_path = public;
alter function public.update_assignments_updated_at() set search_path = public;
alter function public.update_updated_at_column() set search_path = public;

-- -----------------------------------------------------------------------------
-- 7. Function privileges: nothing callable by anon; trigger functions not
--    callable over the API at all.
-- -----------------------------------------------------------------------------

revoke execute on function
  public.confirm_assignment(uuid, uuid),
  public.start_job(uuid),
  public.complete_job(uuid, uuid, integer),
  public.apply_cancellation_fee(uuid, uuid, numeric),
  public.is_admin(),
  public.is_request_customer(uuid),
  public.is_assigned_technician(uuid, boolean),
  public.shares_request_with(uuid),
  public.can_view_technician_location(uuid),
  public.can_review(uuid, uuid)
from public, anon;

grant execute on function
  public.confirm_assignment(uuid, uuid),
  public.start_job(uuid),
  public.complete_job(uuid, uuid, integer),
  public.apply_cancellation_fee(uuid, uuid, numeric),
  public.is_admin(),
  public.is_request_customer(uuid),
  public.is_assigned_technician(uuid, boolean),
  public.shares_request_with(uuid),
  public.can_view_technician_location(uuid),
  public.can_review(uuid, uuid)
to authenticated;

revoke execute on function
  public.handle_new_user(),
  public.create_technician_wallet(),
  public.guard_profile_fields(),
  public.guard_service_request_fields()
from public, anon, authenticated;

commit;
