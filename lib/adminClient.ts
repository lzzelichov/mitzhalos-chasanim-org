// Client-readable companion to the http-only admin cookie. This is only a UI
// hint (which links/dashboard to show). Real authorization is always enforced
// server-side via the signed http-only `wf_admin` cookie.
export const ADMIN_UI_COOKIE = 'wf_admin_ui';

export function hasAdminUiCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c.startsWith(`${ADMIN_UI_COOKIE}=1`));
}
