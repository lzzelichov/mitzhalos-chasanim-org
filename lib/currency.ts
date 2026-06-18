// USD only.
export type Currency = 'usd';

export const CURRENCY_SYMBOL: Record<Currency, string> = { usd: '$' };

// USD preset donation amounts.
export const PRESETS: Record<Currency, number[]> = {
  usd: [18, 36, 54, 100, 180],
};

export function isCurrency(v: unknown): v is Currency {
  return v === 'usd';
}

export function formatCurrency(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}
