/** Tiny classnames helper (no dependency needed). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Inclusive list of YYYY-MM-DD strings between start and end (capped for safety). */
export function enumerateDateRange(start: string, end: string, cap = 366): string[] {
  const out: string[] = [];
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return out;
  const cur = new Date(s);
  while (cur <= e && out.length < cap) {
    out.push(toISODate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/** Local-safe YYYY-MM-DD (avoids UTC off-by-one from toISOString). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dayOfMonth(dateStr: string): number {
  return Number(dateStr.slice(8, 10));
}

/** "$1,234" style formatting. */
export function formatMoney(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** Localized, human date label, e.g. "June 1, 2025" / "1 ביוני 2025". */
export function formatDateLabel(dateStr: string, locale: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  try {
    return d.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function clampPercent(raised: number, goal: number): number {
  if (!goal || goal <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((raised / goal) * 100)));
}

export const DONATION_PRESETS = [18, 36, 54, 100];

/**
 * Public base URL — works in dev, on Vercel, and locally.
 * Order: NEXT_PUBLIC_SITE_URL → VERCEL_URL (production) → provided fallback.
 */
export function getSiteUrl(fallback = ''): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return fallback;
}
