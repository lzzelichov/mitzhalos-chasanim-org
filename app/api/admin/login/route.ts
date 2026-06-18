import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkPassword, adminToken, ADMIN_COOKIE } from '@/lib/auth';
import { ADMIN_UI_COOKIE } from '@/lib/adminClient';

const MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: '' }));

  if (!checkPassword((password ?? '').toString())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const jar = cookies();
  // Signed, http-only cookie = the real authorization gate.
  jar.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
  // Client-readable UI hint (so the navbar/dashboard know to show admin links).
  jar.set(ADMIN_UI_COOKIE, '1', {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const jar = cookies();
  jar.delete(ADMIN_COOKIE);
  jar.delete(ADMIN_UI_COOKIE);
  return NextResponse.json({ ok: true });
}
