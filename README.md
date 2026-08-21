# workwithme.lol

The professional leaderboard where money talks. Bid for your spot. Get seen. Get outbid. Do it again.

**How high are you willing to go?**

Production: [https://workwithme.lol](https://workwithme.lol)

This repo still lives at [github.com/travisrr/hireme-lol](https://github.com/travisrr/hireme-lol). The public product, custom domain, CORS, Stripe URLs, and Wrangler routes are **workwithme.lol**.

---

## What it is

One global leaderboard of people. Rank is purchased attention. We do not claim a higher bid means a better professional.

Loop: **Join → Bid → Rank → Share → Get Outbid → Bid Again.**

CTA: **GET ON THE BOARD**  
Microcopy: Higher bid = higher rank. That's basically it.

Launch economics: **$5 to enter**, **+$1 to overtake**. Stripe one-time bids. Outbid drops you down the board; it does not delete you.

Read [PRODUCT.md](./PRODUCT.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Domain

| Host | Status | Action |
| --- | --- | --- |
| **workwithme.lol** | Purchased. Cloudflare NS (`deb.ns` / `odin.ns`). No public A record until the Worker is attached. | **Deploy target. Custom domain.** |
| **hireme.lol** | Taken / parked. A `54.215.31.113` → `lively-fog-cef0.louddrums.workers.dev?domain=hireme.lol` → merch. | **Not ours. Do not buy. Do not deploy here.** |

Do not register domains from this work. `.lol` is dashboard-only on Cloudflare.

---

## This PR (founding preview)

- High-fidelity homepage on **clearly labeled mock data**
- Shared ranking / min-bid / tie-break library + tests
- D1 schema (`migrations/0001_init.sql`) reserved for later boards, **v1 global only**
- Hono Worker stub (`/api/health`, `/api/config`)
- Wrangler aimed at `workwithme.lol`

The mock board is **not live**. Production starts empty. No fake users. No fake bids.

---

## Local setup

Requires Node 22+.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Copy `.env.example` to `.env` if you add secrets later. **Never commit `.env` or `.dev.vars`.**

---

## Environment

See [`.env.example`](./.env.example).

Important public values:

- `PUBLIC_SITE_ORIGIN=https://workwithme.lol`
- Stripe success/cancel URLs on **workwithme.lol**
- CORS allowlist: `https://workwithme.lol`, `https://www.workwithme.lol`, localhost

`hireme.lol` must not appear as an origin, webhook URL, or custom domain.

---

## Cloudflare

Stack: Workers + Assets + D1 + R2 + Turnstile + Wrangler. No AWS / Firebase / Supabase / Vercel.

After Cloudflare login (do this on Travis’s machine, not from a bot buying infra):

```bash
npx wrangler login
npx wrangler d1 create workwithme
# paste database_id into wrangler.jsonc
npx wrangler d1 migrations apply workwithme --local
npx wrangler r2 bucket create workwithme-media
npm run build
npx wrangler deploy
```

`wrangler.jsonc` already declares Custom Domains:

- `workwithme.lol`
- `www.workwithme.lol`

The zone must be in the same Cloudflare account. The Worker **is** the origin.

Do not attach `hireme.lol`.

---

## Stripe

One-time Checkout, not subscriptions. Webhook is authoritative.

Local later:

```bash
stripe listen --forward-to localhost:8787/api/stripe/webhook
```

Production webhook URL: `https://workwithme.lol/api/stripe/webhook`

Idempotency: `stripe_events.id` primary key. Concurrent applies: D1 `batch` + compare-and-swap on `listings.current_bid_cents`. Tests for ranking, ties, min bid, and webhook replay live in `tests/`.

Do not create a paid Stripe account in someone else’s name from this repo. Test mode keys in `.env` only.

---

## Delay

Categories, cities, SMS, native apps, LinkedIn APIs, AI, résumés, recruiter dashboards, messaging, jobs.
