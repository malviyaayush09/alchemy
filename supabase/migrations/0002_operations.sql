-- Operations additions (approved 2026-10-01): closed dates + staff alert recipients.
-- Run once in the Supabase SQL editor after 0001_init.sql. Safe to re-run.

-- Days the bakery takes no deliveries (holidays, festivals). Customers can't pick these dates.
create table if not exists closed_dates (
  date        date primary key,
  reason      text,
  created_at  timestamptz not null default now()
);
alter table closed_dates enable row level security;

-- Who gets "new order" and "something broke" emails (comma-separated, set in Admin → Settings).
alter table store_settings add column if not exists alert_emails text not null default '';

-- Refuse a pending order for a closed date even if a stale checkout page tries.
create or replace function create_pending_order_guard() returns trigger language plpgsql as $$
begin
  if exists (select 1 from closed_dates where date = new.delivery_date) then
    raise exception 'DATE_CLOSED';
  end if;
  return new;
end $$;

drop trigger if exists orders_closed_date_guard on orders;
create trigger orders_closed_date_guard before insert on orders
for each row execute function create_pending_order_guard();

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role;
