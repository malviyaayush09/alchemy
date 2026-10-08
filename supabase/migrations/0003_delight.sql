-- 0003_delight.sql: surprise deliveries + "remind me next year".
-- Run once in Supabase → SQL Editor after 0001 + 0002. Safe to re-run.

-- Surprise deliveries: the address belongs to the recipient; the orderer stays
-- the contact. The rider calls the orderer (not the recipient) if needed, and the
-- gift note goes in a sealed envelope. Shown to staff in admin + kitchen sheet.
alter table orders add column if not exists is_surprise boolean not null default false;
alter table orders add column if not exists recipient_name text;
alter table orders add column if not exists recipient_phone text;
do $$ begin
  alter table orders add constraint orders_recipient_phone_chk check (recipient_phone is null or recipient_phone ~ '^\+91[6-9][0-9]{9}$');
exception when duplicate_object then null;
end $$;

-- Celebration reminders: one email a week before the same date next year.
create table if not exists celebration_reminders (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references orders(id) on delete cascade,
  email         text not null,
  name          text not null default '',
  occasion      text not null,             -- 'birthday' | 'anniversary' | 'other'
  person        text not null default '',  -- whose celebration (optional), e.g. "Riya"
  celebrate_on  date not null,             -- next year's date
  remind_on     date not null,             -- celebrate_on - 7 days
  sent_at       timestamptz,
  cancelled_at  timestamptz,
  created_at    timestamptz not null default now()
);
create unique index if not exists celebration_reminders_order_idx on celebration_reminders (order_id);
create index if not exists celebration_reminders_due_idx on celebration_reminders (remind_on) where sent_at is null and cancelled_at is null;

-- Same rule as every other table: service-role access only.
alter table celebration_reminders enable row level security;
