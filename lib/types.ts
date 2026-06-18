import type { Currency } from './currency';

export type WeddingStatus = 'draft' | 'active' | 'completed';

export interface Wedding {
  id: string;
  slug: string;
  chatan_name_en: string;
  chatan_name_he: string | null;
  kallah_initial: string | null; // public-safe: initial only, never the bride's full name
  wedding_date: string; // YYYY-MM-DD
  hebrew_date_str: string | null;
  venue: string | null;
  city: string | null;
  story: string | null; // HTML from the rich text editor
  goal_usd: number;
  goal_ils: number;
  cover_photo_url: string | null;
  status: WeddingStatus;
  created_at: string;

  // Extended profile — chatan
  chatan_father_name: string | null;
  chatan_mother_name: string | null;
  chatan_born: string | null;
  chatan_learns_works: string | null;
  chatan_link: string | null;
  chatan_bio: string | null; // rich-text HTML
  // Extended profile — kallah
  kallah_father_name: string | null;
  kallah_mother_name: string | null;
  kallah_born: string | null;
  kallah_learns_works: string | null;
  kallah_link: string | null;
  kallah_bio: string | null; // rich-text HTML
}

export interface DateRow {
  id: string;
  date: string; // YYYY-MM-DD (also used as the URL slug)
  wedding_id: string | null; // null = legacy single-couple date
  title: string | null;
  story: string | null; // HTML from the rich text editor
  photo_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface DonationRow {
  id: string;
  donor_name: string;
  amount: number;
  currency: Currency;
  message: string | null;
  is_anonymous: boolean;
  wedding_id: string | null;
  dedicated_date_id: string | null;
  stripe_session_id: string | null;
  created_at: string;
}

/** Sponsorship state shown on a date tile. */
export interface SponsorTile {
  filled: boolean;
  name: string | null; // null when anonymous
}

/** A wedding plus its raised total (USD), for listing cards. */
export interface WeddingCardData {
  wedding: Wedding;
  raisedUsd: number;
}

export interface SiteConfig {
  goal_amount: number;
  couple_name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
}

/** A single cell on the home grid (locked or filled). */
export interface Tile {
  date: string; // YYYY-MM-DD
  slug: string; // same as date
  dayNumber: number; // day-of-month for the big label
  filled: boolean;
  title: string | null;
  photoUrl: string | null;
}

/** Lightweight date option for dropdowns (donate / search). */
export interface DateOption {
  id: string;
  date: string;
  title: string | null;
}
