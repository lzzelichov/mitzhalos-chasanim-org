# 💍 Wedding Fundraiser

A warm, bilingual (English / Hebrew) wedding fundraising site. Every calendar
date is a **tile** the couple can fill with a memory, photo, or milestone.
Visitors browse the dates, read the stories, and donate — optionally dedicating
a gift to a specific date.

Built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Supabase**,
**Stripe Checkout**, and **next-intl** (full RTL support for Hebrew).

---

## ✨ Features

- **Home grid** of date tiles — locked 🔒 until filled, then glowing gold with a teaser.
- **Fundraising progress bar** with confetti bursts at 25 / 50 / 75 / 100 % milestones.
- **Date detail pages** (`/date/[slug]`) with story, photo, and a "brought to you by" dedication badge.
- **Admin upload** (`/admin/upload`) — password-protected, rich-text editor (react-quill), photo upload to Supabase Storage, edit/delete list.
- **Donate page** (`/donate`) — Stripe Checkout, preset & custom amounts, optional date dedication.
- **Thank-you page** — animated confetti, share button.
- **Search** — by date, keyword (title/story), or donor name.
- **Bilingual EN/HE** with a navbar toggle; the `<html dir>` flips to RTL automatically for Hebrew.
- Mobile-first, Framer Motion transitions, loading skeletons.

> The app runs even **without** any keys configured — tiles render locked, the
> progress bar shows 0, and data-dependent features show a friendly "not
> configured" notice. Add the keys below to light everything up.

---

## 🚀 Quick start

```bash
npm install
cp .env.example .env.local   # then fill in your values
npm run dev                  # http://localhost:3001
```

The app redirects `/` → `/en` (or `/he`). Routes are locale-prefixed.

---

## 🔧 Environment variables

See [`.env.example`](./.env.example). Summary:

| Variable | Required for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | data | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | data | public read access |
| `SUPABASE_SERVICE_ROLE_KEY` | admin uploads, webhook writes | **server-only**, keep secret |
| `STRIPE_SECRET_KEY` | donations | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | donations | (kept for client use / future Elements) |
| `STRIPE_WEBHOOK_SECRET` | recording donations | from `stripe listen` or dashboard |
| `ADMIN_PASSWORD` | `/admin/upload` | any string |
| `NEXT_PUBLIC_SITE_URL` | Stripe redirects | e.g. `http://localhost:3001` |
| `START_DATE`, `END_DATE` | home grid range | inclusive, `YYYY-MM-DD` |
| `GOAL_AMOUNT`, `COUPLE_NAME` | optional | fallbacks if `site_config` row is missing |

---

## 🗄️ Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates:
   - `dates`, `donations`, `site_config` tables
   - Row-Level Security with **public read** policies (all writes go through the
     service-role key server-side)
   - a public **`date-photos`** Storage bucket
   - a seeded `site_config` row (edit it to set your goal, couple name, dates).
3. Copy your **Project URL** and **anon** + **service_role** keys from
   **Project Settings → API** into `.env.local`.

### Schema overview

```
dates(id, date UNIQUE, title, story, photo_url, is_published, created_at)
donations(id, donor_name, amount, message, dedicated_date_id → dates.id, stripe_session_id, created_at)
site_config(id, goal_amount, couple_name, start_date, end_date)
```

---

## 💳 Stripe setup

1. Grab your test **secret** and **publishable** keys from the Stripe Dashboard
   (Developers → API keys) and put them in `.env.local`.
2. **Local webhook** — install the [Stripe CLI](https://stripe.com/docs/stripe-cli), then:

   ```bash
   stripe login
   stripe listen --forward-to localhost:3001/api/webhook
   ```

   Copy the printed `whsec_…` value into `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`.
3. **Production webhook** — in the Dashboard, add an endpoint at
   `https://YOUR_DOMAIN/api/webhook` listening for **`checkout.session.completed`**,
   then copy its signing secret into your deployment env.

Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

On a completed checkout, the webhook inserts a row into `donations`, which feeds
the home-page progress bar and the per-date dedication badge.

---

## 🔐 Admin

Visit `/admin/upload`, enter `ADMIN_PASSWORD`. A signed, http-only cookie keeps
you logged in for 8 hours. Photo uploads and row writes use the service-role key
on the server, so storage/table RLS stays locked down.

---

## 🌍 Internationalization

- Messages live in [`messages/en.json`](./messages/en.json) and
  [`messages/he.json`](./messages/he.json).
- Locale routing & navigation: [`i18n/routing.ts`](./i18n/routing.ts),
  config in [`i18n/request.ts`](./i18n/request.ts), middleware in
  [`middleware.ts`](./middleware.ts).
- The layout sets `<html lang dir>` so Hebrew renders right-to-left automatically.
  Tailwind **logical** utilities (`ps-*`, `border-s-*`, `insetInlineStart`) keep
  components mirror-correct.

---

## 📁 Project structure

```
app/
  [locale]/
    layout.tsx            # html/dir, fonts, providers, navbar
    page.tsx              # home date grid + progress bar
    date/[slug]/page.tsx  # date detail
    donate/page.tsx       # Stripe checkout form
    search/page.tsx
    thank-you/page.tsx
    admin/upload/page.tsx
  api/
    checkout/route.ts     # create Stripe Checkout session
    webhook/route.ts      # record donations
    search/route.ts
    admin/login/route.ts  # password → signed cookie
    admin/dates/route.ts  # CRUD + photo upload (service role)
components/               # Navbar, DateGrid, ProgressBar, forms, etc.
lib/                      # supabase clients, stripe, auth, data access, utils
messages/                # en.json, he.json
i18n/                     # routing + request config
supabase/schema.sql      # database + storage setup
```

---

## 🧱 Deploy to Vercel

A [`vercel.json`](./vercel.json) is included. Steps:

1. Push to GitHub and import the repo in Vercel (framework auto-detected as Next.js).
2. Run the SQL in **`supabase/setup_all.sql`** against your Supabase project.
3. Add the environment variables below in **Project → Settings → Environment Variables**.
4. Deploy. Then add the production Stripe webhook at `https://YOUR_DOMAIN/api/webhook`
   (event `checkout.session.completed`) and put its signing secret in `STRIPE_WEBHOOK_SECRET`.

### Environment variables for Vercel

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | public read key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | server-only; admin writes + webhook |
| `STRIPE_SECRET_KEY` | ✅ (for donations) | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ (for donations) | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | ✅ (to record donations) | from the Stripe dashboard webhook |
| `ADMIN_PASSWORD` | ✅ | password for `/admin/*` |
| `NEXT_PUBLIC_SITE_URL` | optional | leave unset on Vercel → falls back to `VERCEL_URL` |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | optional | `USD` (USD only) |
| `NEXT_PUBLIC_WHATSAPP_ENABLED` | optional | `false` to hide WhatsApp buttons |
| `RESEND_API_KEY` | optional | enables confirmation emails (skipped if unset) |
| `EMAIL_FROM` | optional | sender for Resend emails |
| `ADMIN_EMAIL` | optional | receives new-donation alerts |
| `START_DATE`, `END_DATE` | optional | legacy single-couple grid range |
| `GOAL_AMOUNT`, `COUPLE_NAME` | optional | fallbacks if no `site_config` row |

> `NEXT_PUBLIC_SITE_URL` is resolved by `getSiteUrl()`:
> `NEXT_PUBLIC_SITE_URL` → `VERCEL_URL` (production) → request origin. So it works
> on Vercel without being set, and you can still override it for a custom domain.

---

## 📜 Scripts

```bash
npm run dev     # development
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```
