# מצהלות חתנים · Mitzhalos Chasanim

A warm, bilingual (English / Hebrew, RTL-aware) site for **Mitzhalos Chasanim**, a
charity that provides full wedding-clothing packages to poor chassidish couples.

Donors pick a date meaningful to them, see the real couples marrying that day, and
sponsor a **full package** (fixed price per couple, $500–$1000) or **any amount**.
Payments run through Stripe (USD only).

## Tech stack

- **Next.js 14** App Router, TypeScript
- **next-intl** for EN/HE with full RTL
- **Supabase** (Postgres + Storage)
- **Stripe** Checkout + webhook (USD only)
- **Tailwind CSS**, `next/font` — Frank Ruhl Libre (body weight 400 + all headings weight 900, both languages)
- Hebrew dates via `@hebcal/hdate`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, stats, feature boxes, latest news |
| `/about` | Mission, how it works, gallery |
| `/sponsor` | **Main page** — pick a date → see couples → sponsor |
| `/news` + `/news/[slug]` | News posts |
| `/contact` | Contact info + form |
| `/admin` | Password-protected dashboard (couples, donations, news, content CMS, settings, photos) |

Everything text on the site is editable from **/admin/content**; toggles and config
live in **/admin/settings**. All text falls back to hardcoded defaults if the DB is
empty or unreachable.

## Setup

1. **Install**
   ```bash
   npm install
   ```
2. **Environment** — copy `.env.example` to `.env.local` and fill in Supabase, Stripe,
   and `ADMIN_PASSWORD`.
3. **Database** — open the Supabase SQL Editor and run [`supabase/setup_all.sql`](supabase/setup_all.sql).
   It creates all tables, RLS policies (public reads only what the site shows; writes go
   through the service-role key), and the `org-photos` storage bucket.
4. **Run**
   ```bash
   npm run dev      # http://localhost:3001
   ```
5. **Stripe webhook** (local) — point a listener at `/api/webhook`:
   ```bash
   stripe listen --forward-to localhost:3001/api/webhook
   ```
   Put the printed `whsec_…` in `STRIPE_WEBHOOK_SECRET`. On production, create a webhook
   endpoint in the Stripe Dashboard for `https://<domain>/api/webhook`.

## Environment variables

| Var | Required | Notes |
|-----|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | public read key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | server-only; admin writes + uploads |
| `STRIPE_SECRET_KEY` | ✅ | for checkout |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | client key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | verifies webhooks |
| `ADMIN_PASSWORD` | ✅ | unlocks `/admin/*` |
| `NEXT_PUBLIC_SITE_URL` | optional | leave unset on Vercel → uses `VERCEL_URL` |
| `RESEND_API_KEY` | optional | enables contact-form emails (skipped if unset) |
| `EMAIL_FROM` | optional | sender for Resend emails |

## Content policy

No images of women anywhere — landscapes, men, clothing items, and synagogues only.
The kallah is never named publicly. These rules are enforced in the UI copy and admin
upload reminders.

## Build

```bash
npm run build    # must pass with 0 errors
```
