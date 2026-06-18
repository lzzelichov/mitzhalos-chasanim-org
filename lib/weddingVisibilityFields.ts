// Client-safe (no server imports): the per-wedding visibility fields + helper.

export const WEDDING_VISIBILITY_FIELDS: { key: string; en: string; he: string }[] = [
  { key: 'meet_couple', en: 'Show "Meet the Couple" section', he: 'הצג "הכירו את הזוג"' },
  { key: 'chatan_bio', en: 'Show chatan bio', he: 'הצג ביוגרפיית החתן' },
  { key: 'kallah_bio', en: 'Show kallah bio', he: 'הצג ביוגרפיית הכלה' },
  { key: 'father_name', en: "Show father's name", he: 'הצג שם האב' },
  { key: 'mother_name', en: "Show mother's name", he: 'הצג שם האם' },
  { key: 'born', en: 'Show born city', he: 'הצג עיר לידה' },
  { key: 'learns_works', en: 'Show yeshiva / workplace', he: 'הצג ישיבה / מקום עבודה' },
  { key: 'personal_link', en: 'Show personal link', he: 'הצג קישור אישי' },
  { key: 'goal', en: 'Show fundraising goal', he: 'הצג יעד גיוס' },
  { key: 'donor_names', en: 'Show donor names on tiles', he: 'הצג שמות תורמים' },
  { key: 'progress', en: 'Show progress bar', he: 'הצג סרגל התקדמות' },
  { key: 'hebrew_date', en: 'Show Hebrew date', he: 'הצג תאריך עברי' },
  { key: 'english_date', en: 'Show English date', he: 'הצג תאריך לועזי' },
  { key: 'date_grid', en: 'Show date grid', he: 'הצג לוח תאריכים' },
  { key: 'whatsapp', en: 'Show WhatsApp share button', he: 'הצג כפתור שיתוף וואטסאפ' },
];

export type WeddingVis = Record<string, boolean>;

/** Default-visible unless explicitly turned off. */
export function visible(vis: WeddingVis, key: string, def = true): boolean {
  return key in vis ? vis[key] : def;
}
