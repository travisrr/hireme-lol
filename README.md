# workwithme.lol

The professional leaderboard where money talks. Bid for your spot. Get seen. Get outbid. Do it again.

**How high are you willing to go?**

Production: [https://workwithme.lol](https://workwithme.lol)

Public name and production domain: **workwithme.lol**.  
Repo: [github.com/travisrr/hireme-lol](https://github.com/travisrr/hireme-lol) — that is not the public name. Do not buy or attach hireme.lol.

---

## What it is

One global leaderboard of people. Rank is purchased attention. We do not claim a higher bid means a better professional.

Loop: **Join → Bid → Rank → Share → Get Outbid → Bid Again.**

CTA: **GET ON THE BOARD**  
Microcopy: Higher bid = higher rank. That's basically it.

Launch economics live in config: **$2 to enter**, **+$2 to overtake**. Next rank = qualifying bid + $2. Do not revert to $5 / +$1. Stripe Checkout one-time bids (`mode=payment`). Webhook is authoritative. Outbid drops you down the board; it does not delete you.

Read [PRODUCT.md](./PRODUCT.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Domain

| Host | Status | Action |
| --- | --- | --- |
| **workwithme.lol** | Purchased. Cloudflare NS. | **Deploy target. Custom domain.** |
| **hireme.lol** | Taken / parked. | **Not ours. Do not buy. Do not attach.** |

Do not register domains from this work.

---

## Local setup

Requires Node 22+.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite serves the SPA and a local `/api` (same Hono app as the Worker) against an in-memory store. The board starts **empty**. Magic-link emails are not sent; the API returns a preview URL.

Local loop:

1. GET ON THE BOARD → email a magic link → open the preview URL
2. Create your profile (you type name/photo/headline/links — we do not scrape LinkedIn)
3. Bid. Without Stripe keys, local mode confirms the webhook on localhost only
4. You appear on the live board. Nobody is invented.

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Copy `.env.example` to `.env` for Stripe/OAuth/Resend. **Never commit `.env` or `.dev.vars`.**
Stripe secret/setup is held until Travis is ready — placeholders only. Do not invent keys.

---

## Environment

See [`.env.example`](./.env.example).

- `PUBLIC_SITE_ORIGIN=https://workwithme.lol`
- Stripe Checkout success/cancel and webhook on **workwithme.lol**
- CORS: `https://workwithme.lol`, `https://www.workwithme.lol`, localhost
- `ADMIN_EMAILS` — comma-separated
- Optional: `GITHUB_CLIENT_ID` / `GOOGLE_CLIENT_ID` for OAuth
- Optional: `RESEND_API_KEY` for magic-link + outbid mail
- Optional: Turnstile keys
- Optional: `CF_WEB_ANALYTICS_TOKEN` — Cloudflare Web Analytics JS beacon (same `beacon.min.js` snippet as docu-coach). Injected into HTML when set; omitted when missing. No Google Analytics, Clarity, or extra third-party analytics.
  - Cloudflare Dashboard → Analytics & logs → Web Analytics → Add a site for workwithme.lol (www shares the apex token) → `npx wrangler secret put CF_WEB_ANALYTICS_TOKEN`
  - `CF_BEACON_TOKEN` is accepted as an alias.

`hireme.lol` must not appear as an origin, webhook URL, or custom domain.

---

## Cloudflare deploy (workwithme.lol)

Deploy target: **https://workwithme.lol** only. Do not buy or attach hireme.lol.

On Travis’s machine (needs Cloudflare login; this repo does not purchase anything):

```bash
npx wrangler login
npx wrangler d1 create workwithme
# paste database_id into wrangler.jsonc
npx wrangler r2 bucket create workwithme-media
npm run db:migrate:local
npm run db:migrate:remote
# Stripe secrets are held until Travis is ready. Do not invent or put them.
# npx wrangler secret put STRIPE_SECRET_KEY
# npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put ADMIN_EMAILS
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put CF_WEB_ANALYTICS_TOKEN
# optional OAuth:
# npx wrangler secret put GITHUB_CLIENT_ID
# npx wrangler secret put GITHUB_CLIENT_SECRET
# npx wrangler secret put GOOGLE_CLIENT_ID
# npx wrangler secret put GOOGLE_CLIENT_SECRET
npm run build
npx wrangler deploy
```

`wrangler.jsonc` already declares Custom Domains:

- `workwithme.lol`
- `www.workwithme.lol`

The Worker **is** the origin. Production D1 is the board of record. Production starts empty.

---

## Stripe

One-time Checkout Sessions (`mode=payment`) only. No subscriptions. `payment_method_types` is omitted so Dashboard Link / dynamic methods work.

**Secret/setup is held until Travis is ready.** Env placeholders only: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Optional `STRIPE_PUBLISHABLE_KEY` for client-side use. Do not invent keys. Do not commit values. Do not `wrangler secret put` Stripe values from this repo until Travis sets them.

Local (no keys): creating a bid inserts `pending` only. The localhost webhook confirm path applies rank. Pending bids do not move the board.

Production webhook (when Travis sets the destination): `https://workwithme.lol/api/stripe/webhook`

The webhook is the **only** rank commit. Apply on `checkout.session.completed`. Revert on `charge.refunded`. Idempotent on Stripe event id (`stripe_events` primary key). Concurrent applies: apply engine + D1 CAS on `listings.current_bid_cents`. If apply loses the race, request a Stripe refund on the payment intent.

Paddle is not a live provider. Do not add a second payment provider.

---

## Delay

Categories, cities, SMS, native apps, LinkedIn APIs, AI, résumés, recruiter dashboards, messaging, jobs.
