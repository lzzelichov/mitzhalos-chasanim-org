import 'server-only';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const ADMIN_COOKIE = 'wf_admin';

/** Deterministic token derived from the admin password (never store the raw pw). */
export function adminToken(): string {
  const pw = process.env.ADMIN_PASSWORD || '';
  return crypto.createHash('sha256').update('wedding-fund::' + pw).digest('hex');
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  // constant-time compare
  const a = Buffer.from(input);
  const b = Buffer.from(pw);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Is the current request authenticated as admin (valid signed cookie)? */
export function isAdminAuthed(): boolean {
  if (!process.env.ADMIN_PASSWORD) return false;
  const c = cookies().get(ADMIN_COOKIE)?.value;
  return Boolean(c) && c === adminToken();
}
