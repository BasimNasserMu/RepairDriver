-- Broadcast assignment and request changes over Supabase Realtime so the
-- technician inbox updates live. RLS still applies to Realtime subscribers.
-- Safe to re-run.

do $$
declare
  t text;
begin
  foreach t in array array['assignments', 'service_requests'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end;
$$;
