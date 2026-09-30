-- Alchemy storefront schema. Run once in the Supabase SQL editor (or `npm run db:apply`).
-- All tables have RLS enabled with NO policies: the anon key can read nothing.
-- Every read/write goes through the Next.js server using the service-role key.

create extension if not exists pgcrypto;

-- ─── Enums ──────────────────────────────────────────────────────────────────
create type user_role      as enum ('customer', 'staff', 'admin');
create type product_kind   as enum ('cake', 'gift_box');
create type slot_kind      as enum ('standard', 'midnight', 'express');
create type coupon_type    as enum ('flat', 'percent');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type order_status   as enum (
  'pending_payment', 'placed', 'confirmed', 'being_crafted',
  'out_for_delivery', 'delivered', 'cancelled', 'refunded'
);

-- ─── Accounts (own OTP auth; see src/lib/auth) ──────────────────────────────
create table users (
  id          uuid primary key default gen_random_uuid(),
  phone       text unique check (phone ~ '^\+91[6-9][0-9]{9}$'),
  email       text,
  name        text,
  role        user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  check (phone is not null or email is not null)
);
create unique index users_email_key on users (lower(email));

create table sessions (
  id          text primary key,                -- sha256(token); raw token lives only in the cookie
  user_id     uuid not null references users(id) on delete cascade,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);
create index sessions_user_idx on sessions (user_id);

create table otp_codes (
  id           uuid primary key default gen_random_uuid(),
  channel      text not null check (channel in ('sms', 'email')),
  destination  text not null,
  code_hash    text not null,
  attempts     int  not null default 0,
  expires_at   timestamptz not null,
  consumed_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index otp_codes_dest_idx on otp_codes (destination, created_at desc);

create table addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  label       text,
  name        text not null,
  phone       text not null,
  line1       text not null,
  line2       text,
  landmark    text,
  pincode     text not null check (pincode ~ '^[0-9]{6}$'),
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index addresses_user_idx on addresses (user_id);

-- ─── Catalogue ──────────────────────────────────────────────────────────────
create table products (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  display_no   int,
  name         text not null,
  description  text not null default '',
  kind         product_kind not null default 'cake',
  is_active    boolean not null default true,
  is_sold_out  boolean not null default false,
  is_featured  boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table product_variants (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  weight_grams  int  not null check (weight_grams > 0),
  price_paise   int  not null default 0 check (price_paise >= 0),   -- 0 = "Price on request", not purchasable
  is_available  boolean not null default true,
  unique (product_id, weight_grams)
);

create table tags (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  label       text not null,
  sort_order  int not null default 0
);

create table product_tags (
  product_id  uuid not null references products(id) on delete cascade,
  tag_id      uuid not null references tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

create table product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  src           text not null,          -- public URL or /public path
  storage_path  text,                   -- set when stored in Supabase Storage
  width         int  not null,
  height        int  not null,
  alt           text not null default '',
  sort_order    int  not null default 0
);
create index product_images_product_idx on product_images (product_id, sort_order);

-- ─── Delivery ───────────────────────────────────────────────────────────────
create table serviceable_pincodes (
  pincode    text primary key check (pincode ~ '^[0-9]{6}$'),
  area_name  text not null,
  is_active  boolean not null default true
);

create table notify_requests (
  id          uuid primary key default gen_random_uuid(),
  pincode     text not null,
  contact     text not null,
  created_at  timestamptz not null default now()
);

create table delivery_slots (
  id               uuid primary key default gen_random_uuid(),
  label            text not null,
  start_time       time not null,
  end_time         time not null check (end_time > start_time),
  capacity         int  not null check (capacity >= 0),   -- orders per slot per day
  same_day_cutoff  time not null,                          -- IST; same-day orders close at this time
  kind             slot_kind not null default 'standard',
  is_enabled       boolean not null default true,
  sort_order       int not null default 0
);

-- ─── Store settings (single row, editable in admin) ─────────────────────────
create table store_settings (
  id                      int primary key default 1 check (id = 1),
  cake_message_max_chars  int  not null default 30  check (cake_message_max_chars between 0 and 200),
  gift_note_max_chars     int  not null default 200 check (gift_note_max_chars between 0 and 1000),
  max_days_ahead          int  not null default 14  check (max_days_ahead between 0 and 90),
  pending_hold_minutes    int  not null default 15  check (pending_hold_minutes between 5 and 60),
  delivery_fee_paise      int  not null default 0   check (delivery_fee_paise >= 0),
  min_order_paise         int  not null default 0   check (min_order_paise >= 0),
  gst_rate_bps            int  not null default 0   check (gst_rate_bps between 0 and 5000),  -- 1800 = 18%
  prices_include_gst      boolean not null default true,
  hsn_code                text not null default '',
  updated_at              timestamptz not null default now()
);

-- ─── Coupons ────────────────────────────────────────────────────────────────
create table coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique check (code = upper(code) and code ~ '^[A-Z0-9_-]{3,32}$'),
  type             coupon_type not null,
  value            int  not null check (value > 0),         -- paise for flat, whole percent for percent
  min_order_paise  int  not null default 0,
  expires_at       timestamptz,
  usage_limit      int  check (usage_limit is null or usage_limit > 0),
  used_count       int  not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  check (type <> 'percent' or value <= 100)
);

-- ─── Orders ─────────────────────────────────────────────────────────────────
create sequence order_number_seq start 1001;

create table orders (
  id                   uuid primary key default gen_random_uuid(),
  order_number         text not null unique,
  user_id              uuid references users(id) on delete set null,
  customer_name        text not null,
  phone                text not null check (phone ~ '^\+91[6-9][0-9]{9}$'),
  email                text not null,
  address_line1        text not null,
  address_line2        text,
  landmark             text,
  pincode              text not null,
  area_name            text not null,
  delivery_date        date not null,
  slot_id              uuid references delivery_slots(id) on delete set null,
  slot_label           text not null,
  subtotal_paise       int  not null,
  discount_paise       int  not null default 0,
  delivery_fee_paise   int  not null default 0,
  total_paise          int  not null check (total_paise > 0),
  coupon_id            uuid references coupons(id) on delete set null,
  coupon_code          text,
  gst_rate_bps         int  not null default 0,
  prices_include_gst   boolean not null default true,
  hsn_code             text not null default '',
  status               order_status   not null default 'pending_payment',
  payment_status       payment_status not null default 'pending',
  hold_expires_at      timestamptz,
  razorpay_order_id    text unique,
  razorpay_payment_id  text,
  paid_at              timestamptz,
  rider_name           text,
  rider_phone          text,
  tracking_url         text,
  invoice_no           text unique,
  invoice_date         date,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index orders_slot_idx   on orders (delivery_date, slot_id, status);
create index orders_user_idx   on orders (user_id, created_at desc);
create index orders_phone_idx  on orders (phone, created_at desc);
create index orders_status_idx on orders (status, delivery_date);

create table order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  product_id    uuid references products(id) on delete set null,
  variant_id    uuid references product_variants(id) on delete set null,
  product_name  text not null,
  weight_grams  int  not null,
  unit_paise    int  not null,
  quantity      int  not null check (quantity between 1 and 20),
  cake_message  text,
  gift_note     text
);
create index order_items_order_idx on order_items (order_id);

create table order_status_events (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  from_status order_status,
  to_status   order_status not null,
  actor_id    uuid references users(id) on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);
create index order_status_events_order_idx on order_status_events (order_id, created_at);

create table payment_events (
  id           text primary key,          -- Razorpay x-razorpay-event-id: replays are no-ops
  type         text not null,
  payload      jsonb not null,
  received_at  timestamptz not null default now()
);

create table notification_log (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references orders(id) on delete cascade,
  channel     text not null,
  template    text not null,
  recipient   text not null,
  status      text not null,               -- sent | skipped | failed
  error       text,
  created_at  timestamptz not null default now()
);

create table invoice_counters (
  fy       text primary key,               -- e.g. 2026-27
  last_no  int not null default 0
);

create table rate_limits (
  key           text primary key,
  window_start  timestamptz not null,
  count         int not null
);

-- ─── RLS: on everywhere, no policies ────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'users','sessions','otp_codes','addresses','products','product_variants','tags','product_tags',
    'product_images','serviceable_pincodes','notify_requests','delivery_slots','store_settings','coupons',
    'orders','order_items','order_status_events','payment_events','notification_log','invoice_counters','rate_limits'
  ] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- ─── Functions ──────────────────────────────────────────────────────────────

-- Orders that occupy a slot: paid and active, or unpaid but still inside their hold window.
create or replace function slot_booked_count(p_date date, p_slot uuid)
returns int language sql stable as $$
  select count(*)::int from orders
  where delivery_date = p_date and slot_id = p_slot
    and (status in ('placed','confirmed','being_crafted','out_for_delivery','delivered')
         or (status = 'pending_payment' and hold_expires_at > now()));
$$;

-- Atomically check slot capacity + coupon usage, then create the pending order and its items.
-- Totals are computed (and re-priced from the DB) by the caller in src/lib/checkout.ts.
create or replace function create_pending_order(p jsonb)
returns table (order_id uuid, order_number text)
language plpgsql as $$
declare
  v_slot       delivery_slots%rowtype;
  v_coupon     coupons%rowtype;
  v_id         uuid;
  v_number     text;
  v_hold       int;
  v_coupon_use int;
begin
  select * into v_slot from delivery_slots where id = (p->>'slot_id')::uuid for update;
  if not found or not v_slot.is_enabled then
    raise exception 'SLOT_UNAVAILABLE';
  end if;
  if slot_booked_count((p->>'delivery_date')::date, v_slot.id) >= v_slot.capacity then
    raise exception 'SLOT_FULL';
  end if;

  if p->>'coupon_id' is not null then
    select * into v_coupon from coupons where id = (p->>'coupon_id')::uuid for update;
    if not found or not v_coupon.is_active or (v_coupon.expires_at is not null and v_coupon.expires_at <= now()) then
      raise exception 'COUPON_INVALID';
    end if;
    if v_coupon.usage_limit is not null then
      select count(*) into v_coupon_use from orders
      where coupon_id = v_coupon.id and status = 'pending_payment' and hold_expires_at > now();
      if v_coupon.used_count + v_coupon_use >= v_coupon.usage_limit then
        raise exception 'COUPON_EXHAUSTED';
      end if;
    end if;
  end if;

  select pending_hold_minutes into v_hold from store_settings where id = 1;
  v_number := (p->>'order_prefix') || '-' || lpad(nextval('order_number_seq')::text, 6, '0');

  insert into orders (
    order_number, user_id, customer_name, phone, email, address_line1, address_line2, landmark,
    pincode, area_name, delivery_date, slot_id, slot_label, subtotal_paise, discount_paise,
    delivery_fee_paise, total_paise, coupon_id, coupon_code, gst_rate_bps, prices_include_gst,
    hsn_code, hold_expires_at
  ) values (
    v_number, nullif(p->>'user_id','')::uuid, p->>'customer_name', p->>'phone', p->>'email',
    p->>'address_line1', nullif(p->>'address_line2',''), nullif(p->>'landmark',''),
    p->>'pincode', p->>'area_name', (p->>'delivery_date')::date, v_slot.id, v_slot.label,
    (p->>'subtotal_paise')::int, (p->>'discount_paise')::int, (p->>'delivery_fee_paise')::int,
    (p->>'total_paise')::int, nullif(p->>'coupon_id','')::uuid, nullif(p->>'coupon_code',''),
    (p->>'gst_rate_bps')::int, (p->>'prices_include_gst')::boolean, coalesce(p->>'hsn_code',''),
    now() + make_interval(mins => coalesce(v_hold, 15))
  ) returning id into v_id;

  insert into order_items (order_id, product_id, variant_id, product_name, weight_grams, unit_paise, quantity, cake_message, gift_note)
  select v_id, (i->>'product_id')::uuid, (i->>'variant_id')::uuid, i->>'product_name', (i->>'weight_grams')::int,
         (i->>'unit_paise')::int, (i->>'quantity')::int, nullif(i->>'cake_message',''), nullif(i->>'gift_note','')
  from jsonb_array_elements(p->'items') as i;

  insert into order_status_events (order_id, from_status, to_status, note)
  values (v_id, null, 'pending_payment', 'Checkout started');

  return query select v_id, v_number;
end $$;

-- Called ONLY from the verified Razorpay webhook. Idempotent: returns null if already paid.
create or replace function mark_order_paid(p_razorpay_order_id text, p_payment_id text, p_amount int)
returns uuid language plpgsql as $$
declare v_order orders%rowtype;
begin
  select * into v_order from orders where razorpay_order_id = p_razorpay_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.payment_status = 'paid' then return null; end if;
  if v_order.total_paise <> p_amount then raise exception 'AMOUNT_MISMATCH'; end if;

  update orders set payment_status = 'paid', status = 'placed', paid_at = now(),
         razorpay_payment_id = p_payment_id, hold_expires_at = null, updated_at = now()
  where id = v_order.id;

  insert into order_status_events (order_id, from_status, to_status, note)
  values (v_order.id, v_order.status, 'placed', 'Payment verified');

  if v_order.coupon_id is not null then
    update coupons set used_count = used_count + 1 where id = v_order.coupon_id;
  end if;
  return v_order.id;
end $$;

-- Sequential invoice numbers per Indian financial year.
create or replace function next_invoice_no(p_fy text)
returns int language plpgsql as $$
declare v int;
begin
  insert into invoice_counters (fy, last_no) values (p_fy, 1)
  on conflict (fy) do update set last_no = invoice_counters.last_no + 1
  returning last_no into v;
  return v;
end $$;

-- Fixed-window rate limiter. Returns true if the call is allowed.
create or replace function hit_rate_limit(p_key text, p_window_seconds int, p_max int)
returns boolean language plpgsql as $$
declare v rate_limits%rowtype;
begin
  insert into rate_limits (key, window_start, count) values (p_key, now(), 1)
  on conflict (key) do update set
    count        = case when rate_limits.window_start < now() - make_interval(secs => p_window_seconds) then 1 else rate_limits.count + 1 end,
    window_start = case when rate_limits.window_start < now() - make_interval(secs => p_window_seconds) then now() else rate_limits.window_start end
  returning * into v;
  return v.count <= p_max;
end $$;

-- Functions are callable only with the service role.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role;

-- ─── Storage bucket for product photos (public read) ────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
