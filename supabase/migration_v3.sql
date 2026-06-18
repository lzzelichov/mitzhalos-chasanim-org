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
