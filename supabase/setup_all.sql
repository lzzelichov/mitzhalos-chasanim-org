-- ============================================================
-- Combined setup: schema + migration_v2 + v3 + v4 (run once, in order, idempotent)
-- Paste into Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

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

-- ======================== MIGRATION V2 ====================

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

-- ======================== MIGRATION V3 ====================

-- ============================================================
--  Wedding Fundraiser — Migration v3
--  Extended chatan/kallah profile fields, remove blessing, default active.
--  Run AFTER schema.sql + migration_v2.sql.
-- ============================================================

-- Extended profile fields on weddings
alter table public.weddings
  add column if not exists chatan_father_name  text,
  add column if not exists chatan_mother_name  text,
  add column if not exists chatan_born         text,
  add column if not exists chatan_learns_works text,
  add column if not exists chatan_link         text,
  add column if not exists chatan_bio          text,
  add column if not exists kallah_father_name  text,
  add column if not exists kallah_mother_name  text,
  add column if not exists kallah_born         text,
  add column if not exists kallah_learns_works text,
  add column if not exists kallah_link         text,
  add column if not exists kallah_bio          text;

-- New weddings default to 'active'
alter table public.weddings alter column status set default 'active';

-- Activate any existing drafts
update public.weddings set status = 'active' where status = 'draft';

-- Blessing field removed from the product
alter table public.donations drop column if exists blessing_message;

-- ======================== MIGRATION V4 ====================

-- ============================================================
--  Wedding Fundraiser — Migration v4
--  Content CMS (site_content), per-wedding visibility, WhatsApp
--  templates, and donations.email_sent. Run after v2 + v3.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Editable site content (CMS) ----------
create table if not exists public.site_content (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  value_en    text not null default '',
  value_he    text not null default '',
  section     text not null default 'general',
  label       text not null default '',
  type        text not null default 'text',
  is_visible  boolean not null default true,
  updated_at  timestamptz not null default now()
);

-- ---------- Per-wedding field visibility ----------
create table if not exists public.wedding_visibility (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid references public.weddings(id) on delete cascade,
  field_name  text not null,
  is_visible  boolean not null default true,
  unique (wedding_id, field_name)
);
create index if not exists wedding_visibility_idx on public.wedding_visibility (wedding_id);

-- ---------- Editable WhatsApp templates ----------
create table if not exists public.whatsapp_templates (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  body_en     text not null default '',
  body_he     text not null default '',
  updated_at  timestamptz not null default now()
);

-- ---------- donations: track email confirmation ----------
alter table public.donations add column if not exists email_sent boolean not null default false;

-- ---------- RLS: public read ----------
alter table public.site_content       enable row level security;
alter table public.wedding_visibility enable row level security;
alter table public.whatsapp_templates enable row level security;

drop policy if exists "public read site_content" on public.site_content;
create policy "public read site_content" on public.site_content for select using (true);
drop policy if exists "public read wedding_visibility" on public.wedding_visibility;
create policy "public read wedding_visibility" on public.wedding_visibility for select using (true);
drop policy if exists "public read whatsapp_templates" on public.whatsapp_templates;
create policy "public read whatsapp_templates" on public.whatsapp_templates for select using (true);
-- Writes happen server-side via the service-role key.

-- ---------- Seed global visibility toggles ----------
-- (Text strings + WhatsApp templates are seeded from code via the admin
--  "Load defaults" button in /admin/content, which upserts the full set.)
insert into public.site_content (key, value_en, value_he, section, label, type) values
  ('show_search','true','true','settings','Show search page','toggle'),
  ('show_donor_names','true','true','settings','Show donor names publicly','toggle'),
  ('show_total_raised','true','true','settings','Show total amount raised','toggle'),
  ('show_goal','true','true','settings','Show goal amount','toggle'),
  ('show_hebrew_calendar','true','true','settings','Show Hebrew calendar','toggle'),
  ('show_english_calendar','true','true','settings','Show English calendar','toggle'),
  ('show_shabbat','true','true','settings','Show Shabbat highlights','toggle'),
  ('show_yom_tov','true','true','settings','Show Yom Tov highlights','toggle'),
  ('show_whatsapp','true','true','settings','Show WhatsApp buttons','toggle'),
  ('show_footer_admin','true','true','settings','Show footer admin link','toggle'),
  ('show_language_toggle','true','true','settings','Show language toggle','toggle'),
  ('enable_donations','true','true','settings','Enable donations','toggle'),
  ('show_fully_funded_badge','true','true','settings','Show fully funded badge','toggle')
on conflict (key) do nothing;
