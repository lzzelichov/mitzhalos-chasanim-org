-- ============================================================
--  Wedding Fundraiser — Supabase schema
--  Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------- Tables ----------

create table if not exists public.dates (
  id            uuid primary key default gen_random_uuid(),
  date          date unique not null,
  title         text,
  story         text,                 -- HTML from the rich-text editor
  photo_url     text,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.donations (
  id                 uuid primary key default gen_random_uuid(),
  donor_name         text not null,
  amount             numeric not null check (amount >= 0),
  message            text,
  dedicated_date_id  uuid references public.dates(id) on delete set null,
  stripe_session_id  text,
  created_at         timestamptz not null default now()
);

create table if not exists public.site_config (
  id           uuid primary key default gen_random_uuid(),
  goal_amount  numeric not null default 10000,
  couple_name  text,
  start_date   date,
  end_date     date
);

create index if not exists donations_dedicated_idx on public.donations (dedicated_date_id);

-- ---------- Row Level Security ----------
-- Public users may READ everything (the grid, badges, totals are public).
-- All WRITES happen server-side with the service-role key, which bypasses RLS,
-- so we intentionally do NOT add public insert/update/delete policies.

alter table public.dates       enable row level security;
alter table public.donations   enable row level security;
alter table public.site_config enable row level security;

drop policy if exists "public read dates" on public.dates;
create policy "public read dates" on public.dates
  for select using (true);

drop policy if exists "public read donations" on public.donations;
create policy "public read donations" on public.donations
  for select using (true);

drop policy if exists "public read site_config" on public.site_config;
create policy "public read site_config" on public.site_config
  for select using (true);

-- ---------- Storage bucket for date photos ----------

insert into storage.buckets (id, name, public)
values ('date-photos', 'date-photos', true)
on conflict (id) do nothing;

drop policy if exists "public read date photos" on storage.objects;
create policy "public read date photos" on storage.objects
  for select using (bucket_id = 'date-photos');
-- Uploads are performed server-side with the service-role key (bypasses RLS).

-- ---------- Seed a single site_config row ----------

insert into public.site_config (goal_amount, couple_name, start_date, end_date)
select 10000, 'Alex & Sam', date '2025-06-01', date '2025-06-30'
where not exists (select 1 from public.site_config);
