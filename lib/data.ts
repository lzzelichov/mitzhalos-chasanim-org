import 'server-only';
import { getSupabaseAnon } from './supabase/server';
import { enumerateDateRange, dayOfMonth } from './utils';
import type {
  DateRow,
  DonationRow,
  SiteConfig,
  Tile,
  DateOption,
  Wedding,
  WeddingCardData,
  SponsorTile,
} from './types';

/** Site config from DB, falling back to env defaults so the app always renders. */
export async function getSiteConfig(): Promise<SiteConfig> {
  const fallback: SiteConfig = {
    goal_amount: Number(process.env.GOAL_AMOUNT) || 10000,
    couple_name: process.env.COUPLE_NAME || '',
    start_date: process.env.START_DATE || '2025-06-01',
    end_date: process.env.END_DATE || '2025-06-30',
  };

  const sb = getSupabaseAnon();
  if (!sb) return fallback;

  const { data } = await sb.from('site_config').select('*').limit(1).maybeSingle();
  if (!data) return fallback;

  return {
    goal_amount: data.goal_amount ?? fallback.goal_amount,
    couple_name: data.couple_name ?? fallback.couple_name,
    start_date: data.start_date ?? fallback.start_date,
    end_date: data.end_date ?? fallback.end_date,
  };
}

/** All published dates, keyed for lookup. */
export async function getPublishedDates(): Promise<DateRow[]> {
  const sb = getSupabaseAnon();
  if (!sb) return [];
  const { data } = await sb
    .from('dates')
    .select('*')
    .is('wedding_id', null)
    .eq('is_published', true)
    .order('date', { ascending: true });
  return (data as DateRow[]) ?? [];
}

/** Build the home grid: every calendar day in range, marked locked/filled. */
export async function getTiles(): Promise<Tile[]> {
  const [config, published] = await Promise.all([getSiteConfig(), getPublishedDates()]);
  const byDate = new Map(published.map((d) => [d.date, d]));
  const days = enumerateDateRange(config.start_date, config.end_date);

  return days.map((date) => {
    const row = byDate.get(date);
    return {
      date,
      slug: date,
      dayNumber: dayOfMonth(date),
      filled: Boolean(row),
      title: row?.title ?? null,
      photoUrl: row?.photo_url ?? null,
    };
  });
}

export async function getDateBySlug(slug: string): Promise<DateRow | null> {
  const sb = getSupabaseAnon();
  if (!sb) return null;
  const { data } = await sb
    .from('dates')
    .select('*')
    .is('wedding_id', null)
    .eq('date', slug)
    .eq('is_published', true)
    .maybeSingle();
  return (data as DateRow) ?? null;
}

/** Most recent donation dedicated to a given date (for the badge). */
export async function getDedicationForDate(dateId: string): Promise<DonationRow | null> {
  const sb = getSupabaseAnon();
  if (!sb) return null;
  const { data } = await sb
    .from('donations')
    .select('*')
    .eq('dedicated_date_id', dateId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as DonationRow) ?? null;
}

/** Sum of all recorded donations. */
export async function getDonationsTotal(): Promise<number> {
  const sb = getSupabaseAnon();
  if (!sb) return 0;
  const { data } = await sb.from('donations').select('amount').is('wedding_id', null);
  if (!data) return 0;
  return data.reduce((sum: number, r: { amount: number | null }) => sum + (r.amount ?? 0), 0);
}

/** Published dates as lightweight options for the donate/search dropdowns. */
export async function getDateOptions(): Promise<DateOption[]> {
  const sb = getSupabaseAnon();
  if (!sb) return [];
  const { data } = await sb
    .from('dates')
    .select('id, date, title')
    .is('wedding_id', null)
    .eq('is_published', true)
    .order('date', { ascending: true });
  return (data as DateOption[]) ?? [];
}

// ─────────────────────────── Weddings ───────────────────────────

/** Active + completed weddings with their raised totals (per currency). */
export async function getWeddingCards(): Promise<WeddingCardData[]> {
  const sb = getSupabaseAnon();
  if (!sb) return [];
  const { data } = await sb
    .from('weddings')
    .select(
      'id, slug, chatan_name_en, chatan_name_he, kallah_initial, wedding_date, venue, city, goal_usd, status, created_at'
    )
    .in('status', ['active', 'completed'])
    .order('wedding_date', { ascending: true });
  const raised = await raisedByWedding();
  return ((data as Wedding[]) ?? []).map((w) => ({
    wedding: w,
    raisedUsd: raised.get(w.id) ?? 0,
  }));
}

/** Search active/completed weddings by chatan name, city, venue, or exact date. */
export async function searchWeddings(q: string): Promise<WeddingCardData[]> {
  const sb = getSupabaseAnon();
  if (!sb) return [];
  const term = (q ?? '').replace(/[(),%]/g, ' ').trim();

  let query = sb
    .from('weddings')
    .select(
      'id, slug, chatan_name_en, chatan_name_he, kallah_initial, wedding_date, venue, city, goal_usd, status, created_at'
    )
    .in('status', ['active', 'completed']);

  if (/^\d{4}-\d{2}-\d{2}$/.test(term)) {
    query = query.eq('wedding_date', term);
  } else if (term) {
    query = query.or(
      `chatan_name_en.ilike.%${term}%,chatan_name_he.ilike.%${term}%,city.ilike.%${term}%,venue.ilike.%${term}%`
    );
  }
  query = query.order('wedding_date', { ascending: true }).limit(60);

  const { data } = await query;
  const raised = await raisedByWedding();
  return ((data as Wedding[]) ?? []).map((w) => ({
    wedding: w,
    raisedUsd: raised.get(w.id) ?? 0,
  }));
}

export async function getWeddingBySlug(slug: string): Promise<Wedding | null> {
  const sb = getSupabaseAnon();
  if (!sb) return null;
  const { data } = await sb.from('weddings').select('*').eq('slug', slug).maybeSingle();
  return (data as Wedding) ?? null;
}

export async function getWeddingRaised(weddingId: string): Promise<number> {
  const sb = getSupabaseAnon();
  if (!sb) return 0;
  const { data } = await sb.from('donations').select('amount').eq('wedding_id', weddingId);
  let total = 0;
  for (const d of data ?? []) total += Number(d.amount) || 0;
  return total;
}

/** Map of YYYY-MM-DD → sponsorship state for a wedding's date grid. */
export async function getWeddingSponsored(weddingId: string): Promise<Record<string, SponsorTile>> {
  const sb = getSupabaseAnon();
  if (!sb) return {};

  const [{ data: dates }, { data: dons }] = await Promise.all([
    sb.from('dates').select('id, date').eq('wedding_id', weddingId),
    sb
      .from('donations')
      .select('dedicated_date_id, donor_name, is_anonymous, created_at')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false }),
  ]);

  const byId = new Map((dates ?? []).map((d) => [d.id as string, d.date as string]));
  const result: Record<string, SponsorTile> = {};
  for (const d of dates ?? []) result[d.date as string] = { filled: true, name: null };

  const assigned = new Set<string>();
  for (const don of dons ?? []) {
    const iso = don.dedicated_date_id ? byId.get(don.dedicated_date_id) : undefined;
    if (!iso || assigned.has(iso)) continue;
    assigned.add(iso);
    if (result[iso]) {
      result[iso].name = don.is_anonymous ? null : don.donor_name || null;
    }
  }
  return result;
}

/** Global homepage stats: active/completed weddings, raised total (USD), donor count. */
export async function getGlobalStats(): Promise<{
  weddings: number;
  raisedUsd: number;
  donors: number;
}> {
  const sb = getSupabaseAnon();
  if (!sb) return { weddings: 0, raisedUsd: 0, donors: 0 };
  const [wRes, dRes] = await Promise.all([
    sb.from('weddings').select('id', { count: 'exact', head: true }).in('status', ['active', 'completed']),
    sb.from('donations').select('amount'),
  ]);
  let raisedUsd = 0;
  for (const d of dRes.data ?? []) raisedUsd += Number(d.amount) || 0;
  return {
    weddings: wRes.count ?? 0,
    raisedUsd,
    donors: dRes.data?.length ?? 0,
  };
}

/** Number of donations recorded for a wedding ("X people have supported"). */
export async function getWeddingDonorCount(weddingId: string): Promise<number> {
  const sb = getSupabaseAnon();
  if (!sb) return 0;
  const { count } = await sb
    .from('donations')
    .select('id', { count: 'exact', head: true })
    .eq('wedding_id', weddingId);
  return count ?? 0;
}

/** Per-wedding field visibility overrides (empty = all visible by default). */
export async function getWeddingVisibility(weddingId: string): Promise<Record<string, boolean>> {
  const sb = getSupabaseAnon();
  if (!sb) return {};
  const { data } = await sb
    .from('wedding_visibility')
    .select('field_name, is_visible')
    .eq('wedding_id', weddingId);
  const out: Record<string, boolean> = {};
  for (const r of data ?? []) out[r.field_name as string] = r.is_visible as boolean;
  return out;
}

/** Aggregate donation totals (USD) per wedding (single query). */
async function raisedByWedding(): Promise<Map<string, number>> {
  const sb = getSupabaseAnon();
  const m = new Map<string, number>();
  if (!sb) return m;
  const { data } = await sb
    .from('donations')
    .select('wedding_id, amount')
    .not('wedding_id', 'is', null);
  for (const d of data ?? []) {
    m.set(d.wedding_id, (m.get(d.wedding_id) ?? 0) + (Number(d.amount) || 0));
  }
  return m;
}
