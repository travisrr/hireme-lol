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

Launch economics live in config: **$2 to enter**, **+$2 to overtake**. Stripe one-time bids. Webhook is authoritative. Outbid drops you down the board; it does not delete you.

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

---

## Environment

See [`.env.example`](./.env.example).

- `PUBLIC_SITE_ORIGIN=https://workwithme.lol`
- Stripe success/cancel and webhook on **workwithme.lol**
- CORS: `https://workwithme.lol`, `https://www.workwithme.lol`, localhost
- `ADMIN_EMAILS` — comma-separated
- Optional: `GITHUB_CLIENT_ID` / `GOOGLE_CLIENT_ID` for OAuth
- Optional: `RESEND_API_KEY` for magic-link + outbid mail
- Optional: Turnstile keys
- Optional: `CF_BEACON_TOKEN` — Cloudflare Web Analytics JS beacon (official `beacon.min.js` snippet, injected into HTML when set). If unset, the snippet is omitted. No Google Analytics.
  - Cloudflare Dashboard → Analytics & logs → Web Analytics → Add a site for workwithme.lol → paste the token into `npx wrangler secret put CF_BEACON_TOKEN`
  - Existing `CF_WEB_ANALYTICS_TOKEN` is accepted as an alias so a site already created is not duplicated.

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
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put ADMIN_EMAILS
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put CF_BEACON_TOKEN
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

One-time Checkout, not subscriptions. Webhook commits rank.

Local (with Stripe CLI + test keys):

```bash
stripe listen --forward-to localhost:5173/api/stripe/webhook
```

Production webhook: `https://workwithme.lol/api/stripe/webhook`

Idempotency: `stripe_events.id` primary key. Concurrent applies: apply engine + D1 CAS on `listings.current_bid_cents`. Refund if the raise loses the race.

Do not create a paid Stripe account in someone else’s name from this repo.

---

## Delay

Categories, cities, SMS, native apps, LinkedIn APIs, AI, résumés, recruiter dashboards, messaging, jobs.
