-- ============================================================
--  Wedding Fundraiser — Migration v2
--  Multi-wedding management + payment upgrades (currency, anonymity, blessings).
--  Run AFTER schema.sql, in the Supabase SQL Editor.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- weddings ----------
create table if not exists public.weddings (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  chatan_name_en  text not null,
  chatan_name_he  text,
  kallah_initial  text,                       -- public-safe: initial only (tzniut)
  wedding_date    date not null,
  hebrew_date_str text,
  venue           text,
  city            text default 'Jerusalem',
  story           text,                        -- rich-text HTML
  goal_usd        numeric not null default 0,
  goal_ils        numeric not null default 0,
  cover_photo_url text,
  status          text not null default 'draft' check (status in ('draft','active','completed')),
  created_at      timestamptz not null default now()
);

-- ---------- dates: link to a wedding ----------
alter table public.dates
  add column if not exists wedding_id uuid references public.weddings(id) on delete cascade;

-- Relax the global UNIQUE(date) → per-wedding uniqueness instead.
alter table public.dates drop constraint if exists dates_date_key;
create unique index if not exists dates_legacy_date_uniq
  on public.dates (date) where wedding_id is null;
create unique index if not exists dates_wedding_date_uniq
  on public.dates (wedding_id, date) where wedding_id is not null;
create index if not exists dates_wedding_idx on public.dates (wedding_id);

-- ---------- donations: currency, anonymity, blessing, wedding link ----------
alter table public.donations
  add column if not exists wedding_id uuid references public.weddings(id) on delete set null;
alter table public.donations
  add column if not exists currency text not null default 'usd' check (currency in ('usd','ils'));
alter table public.donations
  add column if not exists is_anonymous boolean not null default false;
alter table public.donations
  add column if not exists blessing_message text;
create index if not exists donations_wedding_idx on public.donations (wedding_id);

-- ---------- RLS: public read for weddings ----------
alter table public.weddings enable row level security;
drop policy if exists "public read weddings" on public.weddings;
create policy "public read weddings" on public.weddings
  for select using (true);
-- Writes happen server-side via the service-role key (bypasses RLS).

-- ---------- Storage: wedding cover photos ----------
insert into storage.buckets (id, name, public)
values ('wedding-covers', 'wedding-covers', true)
on conflict (id) do nothing;

drop policy if exists "public read wedding covers" on storage.objects;
create policy "public read wedding covers" on storage.objects
  for select using (bucket_id = 'wedding-covers');

-- ---------- Optional: seed a sample active wedding ----------
insert into public.weddings (slug, chatan_name_en, chatan_name_he, kallah_initial, wedding_date, venue, city, goal_usd, goal_ils, status)
select 'cohen-jerusalem', 'Yosef Cohen', 'יוסף כהן', 'R', date '2025-06-18', 'Heichal Shlomo', 'Jerusalem', 5000, 18000, 'active'
where not exists (select 1 from public.weddings where slug = 'cohen-jerusalem');
