import 'server-only';
import Stripe from 'stripe';

/** Server-side Stripe instance, or null when no secret key is set. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // apiVersion omitted on purpose -> uses the account's default pinned version.
  return new Stripe(key);
}

export const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
