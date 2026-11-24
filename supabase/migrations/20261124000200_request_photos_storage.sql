-- Private storage for service request photos.
--
-- Layout: request-photos/<customer_id>/<random>.jpg
-- service_requests.photos stores these object paths (not URLs); clients read
-- them with signed URLs. Visible to the uploading customer, technicians
-- assigned to a request that references the photo, and admins.
-- Safe to re-run.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'request-photos', 'request-photos', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.can_view_request_photo(p_path text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.service_requests sr
    where p_path = any (sr.photos)
      and (
        sr.customer_id = auth.uid()
        or public.is_admin()
        or exists (
          select 1 from public.assignments a
          where a.request_id = sr.id and a.technician_id = auth.uid()
        )
      )
  );
$$;

revoke execute on function public.can_view_request_photo(text) from public, anon;
grant execute on function public.can_view_request_photo(text) to authenticated;

drop policy if exists "Customers upload request photos to own folder" on storage.objects;
create policy "Customers upload request photos to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'request-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Request photos visible to participants" on storage.objects;
create policy "Request photos visible to participants"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'request-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.can_view_request_photo(name)
    )
  );

drop policy if exists "Customers delete own request photos" on storage.objects;
create policy "Customers delete own request photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'request-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- A request may only reference photos in its own customer's folder; otherwise
-- a customer could list someone else's photo path and gain read access to it.
create or replace function public.guard_service_request_fields()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_photo text;
begin
  if current_user <> 'authenticated' or public.is_admin() then
    return new;
  end if;

  foreach v_photo in array coalesce(new.photos, '{}') loop
    if v_photo not like new.customer_id::text || '/%' then
      raise exception 'Invalid photo path';
    end if;
  end loop;

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

commit;
