import type { Currency } from './currency';

export type CoupleStatus = 'active' | 'draft' | 'completed';
export type DonationType = 'full_package' | 'partial';

/** A chatan (groom) Mitzhalos Chasanim is helping with wedding clothing. */
export interface Couple {
  id: string;
  chatan_name_he: string | null;
  chatan_name_en: string;
  wedding_date: string; // YYYY-MM-DD
  hebrew_date_str: string | null;
  father_name_he: string | null;
  father_name_en: string | null;
  mother_name_he: string | null;
  mother_name_en: string | null;
  yeshiva: string | null;
  chassidus: string | null;
  extra_info: string | null;
  package_price: number;
  total_raised: number;
  donor_count: number;
  status: CoupleStatus;
  notes: string | null; // internal only — never shown publicly
  created_at: string;
}

export interface Donation {
  id: string;
  couple_id: string | null;
  donor_name: string;
  is_anonymous: boolean;
  amount: number;
  type: DonationType;
  stripe_session_id: string | null;
  status: string; // 'paid'
  currency: Currency;
  email: string | null;
  created_at: string;
  // Joined for admin table convenience.
  couple_name?: string | null;
}

export interface NewsPost {
  id: string;
  slug: string;
  title_he: string | null;
  title_en: string;
  content_he: string | null;
  content_en: string | null;
  photo_url: string | null;
  status: 'published' | 'draft';
  published_at: string | null;
  created_at: string;
}

export interface ContactMsg {
  id: string;
  name: string;
  email: string | null;
  message: string;
  created_at: string;
}

export interface OrgPhoto {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

/** Headline numbers for the homepage stats bar. */
export interface OrgStats {
  couplesHelped: number;
  packagesSponsored: number;
  totalRaised: number;
}

export const CHASSIDUS_OPTIONS = [
  'Chabad',
  'Belz',
  'Ger',
  'Vizhnitz',
  'Satmar',
  'Breslov',
  'Lizhensk',
  'Other',
] as const;
