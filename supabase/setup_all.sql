-- ============================================================
--  Mitzhalos Chasanim — full database setup
--  Run in the Supabase SQL Editor (one shot). Safe to re-run.
-- ============================================================

-- ---------- OPTIONAL: remove the old weddings-era schema ----------
-- The previous app used these tables. Uncomment to drop them and their data.
-- (Only `donations` and `site_content` actually conflict in shape; the rest
--  are simply unused now.)
--
-- drop table if exists public.wedding_visibility cascade;
-- drop table if exists public.whatsapp_templates cascade;
-- drop table if exists public.dates cascade;
-- drop table if exists public.weddings cascade;
-- drop table if exists public.site_config cascade;
-- drop table if exists public.donations cascade;     -- old shape (wedding_id) — conflicts
-- drop table if exists public.site_content cascade;  -- old keys — safe to recreate

-- ---------- Couples (the chassanim we help) ----------
create table if not exists public.couples (
  id              uuid primary key default gen_random_uuid(),
  chatan_name_he  text,
  chatan_name_en  text not null,
  wedding_date    date not null,
  hebrew_date_str text,
  father_name_he  text,
  father_name_en  text,
  mother_name_he  text,
  mother_name_en  text,
  yeshiva         text,
  chassidus       text,
  extra_info      text,
  package_price   numeric not null default 750,
  total_raised    numeric not null default 0,
  donor_count     integer not null default 0,
  status          text not null default 'active' check (status in ('active','draft','completed')),
  notes           text,
  created_at      timestamptz not null default now()
);
create index if not exists couples_date_idx on public.couples (wedding_date);
create index if not exists couples_status_idx on public.couples (status);

-- ---------- Donations ----------
create table if not exists public.donations (
  id                uuid primary key default gen_random_uuid(),
  couple_id         uuid references public.couples (id) on delete set null,
  donor_name        text not null default 'Anonymous',
  is_anonymous      boolean not null default false,
  amount            numeric not null,
  type              text not null default 'partial' check (type in ('full_package','partial')),
  stripe_session_id text,
  status            text not null default 'paid',
  currency          text not null default 'usd',
  email             text,
  created_at        timestamptz not null default now()
);
create index if not exists donations_couple_idx on public.donations (couple_id);

-- ---------- News ----------
create table if not exists public.news_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title_he     text,
  title_en     text not null,
  content_he   text,
  content_en   text,
  photo_url    text,
  status       text not null default 'draft' check (status in ('published','draft')),
  published_at timestamptz,
  created_at   timestamptz not null default now()
);

-- ---------- Contact messages ----------
create table if not exists public.contacts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  message    text not null,
  created_at timestamptz not null default now()
);

-- ---------- Editable site content (CMS) ----------
create table if not exists public.site_content (
  key        text primary key,
  value_en   text not null default '',
  value_he   text not null default '',
  section    text not null default 'homepage',
  label      text not null default '',
  type       text not null default 'text',
  is_visible boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------- Gallery photos (About page) ----------
create table if not exists public.org_photos (
  id         uuid primary key default gen_random_uuid(),
  url        text not null,
  caption    text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
--  Row Level Security
--  Public (anon) may READ only what the public site shows.
--  All writes go through the service-role key (bypasses RLS).
-- ============================================================
alter table public.couples      enable row level security;
alter table public.donations    enable row level security;
alter table public.news_posts   enable row level security;
alter table public.contacts     enable row level security;
alter table public.site_content enable row level security;
alter table public.org_photos   enable row level security;

drop policy if exists "couples public read" on public.couples;
create policy "couples public read" on public.couples
  for select using (status in ('active','completed'));

drop policy if exists "news public read" on public.news_posts;
create policy "news public read" on public.news_posts
  for select using (status = 'published');

drop policy if exists "content public read" on public.site_content;
create policy "content public read" on public.site_content for select using (true);

drop policy if exists "photos public read" on public.org_photos;
create policy "photos public read" on public.org_photos for select using (true);

-- donations + contacts: no anon policy → not readable by the public.

-- ============================================================
--  Storage bucket for gallery + news photos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('org-photos', 'org-photos', true)
on conflict (id) do nothing;

drop policy if exists "org-photos public read" on storage.objects;
create policy "org-photos public read" on storage.objects
  for select using (bucket_id = 'org-photos');
-- Uploads are performed server-side with the service-role key (bypasses RLS).

-- ============================================================
--  OPTIONAL sample couple (uncomment to demo the Sponsor page)
-- ============================================================
-- insert into public.couples (chatan_name_he, chatan_name_en, wedding_date, father_name_en, mother_name_en, yeshiva, chassidus, package_price, status)
-- values ('יוסף', 'Yosef', current_date + 14, 'R. Avraham', 'Mrs. Sarah', 'Yeshivas Tomchei Temimim', 'Chabad', 750, 'active');
