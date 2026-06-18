// Jerusalem / architectural hero backgrounds — SITE POLICY: no people, no women.
// (The spec's wedding-stock images were not used because they may contain people;
//  these curated Jerusalem photos keep the luxury feel within policy.)
const Q = '&q=80&fit=crop';

export const HERO_BG = {
  kotel: `https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1920${Q}`, // Kotel, golden hour
  rooftops: `https://images.unsplash.com/photo-1518368781049-b6e93ba27326?w=1920${Q}`, // Old City rooftops
  alley: `https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1920${Q}`, // stone alley at dusk
  olive: `https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1920${Q}`, // olive trees / landscape
  sunrise: `https://images.unsplash.com/photo-1548407260-da850faa41e3?w=1920${Q}`, // sunrise over Jerusalem
} as const;

export type HeroKey = keyof typeof HERO_BG;

// Per-page hero rotation.
export const PAGE_HERO: Record<string, HeroKey> = {
  home: 'kotel',
  weddings: 'rooftops',
  wedding: 'kotel',
  donate: 'alley',
  thankyou: 'sunrise',
};

// Default cover for weddings without an uploaded photo (landscape, no people).
export const DEFAULT_COVER = HERO_BG.rooftops;
