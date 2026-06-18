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
-- ============================================================
-- End of migration v4
-- ============================================================
