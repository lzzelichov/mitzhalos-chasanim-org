import 'server-only';
import { getSupabaseAnon } from './supabase/server';
import type { Couple, NewsPost, OrgPhoto, OrgStats } from './types';

const COUPLE_PUBLIC =
  'id, chatan_name_he, chatan_name_en, wedding_date, hebrew_date_str, father_name_he, father_name_en, mother_name_he, mother_name_en, yeshiva, chassidus, extra_info, package_price, total_raised, donor_count, status, created_at';

/** Active couples getting married on a given date (the Sponsor results). */
export async function getCouplesByDate(date: string): Promise<Couple[]> {
  const sb = getSupabaseAnon();
  if (!sb) return [];
  const { data } = await sb
    .from('couples')
    .select(COUPLE_PUBLIC)
    .eq('status', 'active')
    .eq('wedding_date', date)
    .order('created_at', { ascending: true });
  return (data as Couple[]) ?? [];
}

export async function getCoupleById(id: string): Promise<Couple | null> {
  const sb = getSupabaseAnon();
  if (!sb) return null;
  const { data } = await sb.from('couples').select(COUPLE_PUBLIC).eq('id', id).maybeSingle();
  return (data as Couple) ?? null;
}

/** Distinct upcoming dates that have at least one active couple (for calendar hints). */
export async function getActiveDates(): Promise<string[]> {
  const sb = getSupabaseAnon();
  if (!sb) return [];
  const { data } = await sb.from('couples').select('wedding_date').eq('status', 'active');
  return Array.from(new Set((data ?? []).map((r) => r.wedding_date as string))).sort();
}

/**
 * Homepage headline numbers — derived entirely from the public `couples` table
 * so the `donations` table (with donor emails) needs no anon read access.
 * "packages sponsored" = couples whose raised total has reached their price.
 */
export async function getOrgStats(): Promise<OrgStats> {
  const sb = getSupabaseAnon();
  if (!sb) return { couplesHelped: 0, packagesSponsored: 0, totalRaised: 0 };
  const { data } = await sb
    .from('couples')
    .select('total_raised, package_price')
    .in('status', ['active', 'completed']);
  let couplesHelped = 0;
  let packagesSponsored = 0;
  let totalRaised = 0;
  for (const c of data ?? []) {
    couplesHelped++;
    const raised = Number(c.total_raised) || 0;
    const price = Number(c.package_price) || 0;
    totalRaised += raised;
    if (price > 0 && raised >= price) packagesSponsored++;
  }
  return { couplesHelped, packagesSponsored, totalRaised };
}

export async function getPublishedNews(limit?: number): Promise<NewsPost[]> {
  const sb = getSupabaseAnon();
  if (!sb) return [];
  let q = sb
    .from('news_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data as NewsPost[]) ?? [];
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  const sb = getSupabaseAnon();
  if (!sb) return null;
  const { data } = await sb
    .from('news_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  return (data as NewsPost) ?? null;
}

export async function getOrgPhotos(): Promise<OrgPhoto[]> {
  const sb = getSupabaseAnon();
  if (!sb) return [];
  const { data } = await sb.from('org_photos').select('*').order('sort_order', { ascending: true });
  return (data as OrgPhoto[]) ?? [];
}
