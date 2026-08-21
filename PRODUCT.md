# workwithme.lol

The internet's most competitive professional directory.

**Public name:** workwithme.lol  
**Understand it in five seconds:** one global leaderboard of people. Money buys the rank. Outbid someone and they fall down the board — they are not deleted. That is the whole product.

Public site: [https://workwithme.lol](https://workwithme.lol)

The GitHub repo is `travisrr/hireme-lol`. That is not the public name. Do not put hireme.lol on the homepage.

---

## What this is

A public, live leaderboard. Rank, photo, name, headline, company, one-line pitch, current bid, movement, LinkedIn, website, Outbid.

The loop:

**Join → Bid → Rank → Share → Get Outbid → Bid Again.**

The leaderboard **is** the product. There is no feed, no job board, no recruiter CRM, no “open to work” social graph hiding behind the board.

---

## What this is not

Not LinkedIn. Not recruiting software. Not a job board. Not a social network. Not a CRM. Not a SaaS dashboard.

We do not claim that a higher rank means a better professional. **Money buys position and attention. That is it.** Say that out loud, on the homepage, in the footer, in the share card. Do not dress it up as merit.

---

## Copy (do not drift)

One public name. The wordmark matches the domain people type.

**Wordmark:** workwithme.lol

**Line:** How high are you willing to go?

**Deck:** The professional leaderboard where money talks. Bid for your spot. Get seen. Get outbid. Do it again.

**CTA:** GET ON THE BOARD

**Microcopy:** Higher bid = higher rank. That's basically it.

**Share:** I'm #37 on workwithme.lol. Think I deserve to be lower?

**Footer:** Money buys placement, not quality.

---

## v1 rules

- **Global only.** One leaderboard. One number. One button.
- Schema may reserve `boards` / nullable `category_id` / `city_id` for later. **Do not launch categories or cities.** No 15 category boards. No city boards.
- Founding 100 / founding-member badge is allowed.
- **Founding seed (explicit):** Elon $6 / Palmer $4 / Jensen $2. Names and bid amounts only. No scraped bios or photos.
- Users type their own name, photo, headline, company, pitch, LinkedIn, and website. **Do not scrape LinkedIn.**
- Stripe **one-time bids**, not subscriptions.
- Outbid moves you down. It does not remove the listing.
- Launch economics live in `site_config` (`min_entry_cents`, `min_increment_cents`) and `/api/config`. Current values: **$2 to enter**, **+$2 to overtake**. Next rank price = current qualifying bid + increment.
- Ties are deterministic: **highest bid**, then **earliest timestamp at that amount**, then **profile `created_at`**.
- Stripe webhooks are authoritative. Checkout is a request; the webhook commits the rank.

---

## Inspired by outbid.lol — interaction model, not a clone

Inspected 2026-08-21. What makes outbid simple:

1. **The page is the marketplace.** No app chrome, no onboarding funnel, no “product” separate from the board.
2. **One action.** Identify yourself and put a number on it. Everything else is a consequence.
3. **Every row prices the next move.** “Claim this rank for $X” is the entire tutorial.
4. **A floor plus an overtake.** New spots start cheap. Taking someone’s place costs their bid plus an increment. Paying less than #1 still puts you on the board wherever that number lands.
5. **Already on the list is the same action.** Same identity, higher bid. No “upgrade plan.”
6. **Activity is a receipt, not a product.** Latest bids exist so you can feel the fight. They are not a social feed.
7. **Identity is the listing.** outbid uses a URL / @handle. We use a person: photo, name, headline, company, pitch, links.

What we deliberately do differently:

- People, not products.
- Auth exists because a person is not a pasteable URL.
- Profiles live at `/{handle}`.
- Outbid never deletes a listing.
- We will not show a fake “this made $X since launch” counter.
- We say the quiet part: rank is purchased attention, not a competence score.

outbid’s #1 claim price appeared to use a larger increment than lower ranks. **We do not copy that.** One increment from config applies at every rank.

---

## Domain

| Name | Status (checked 2026-08-21) | Ours? |
| --- | --- | --- |
| **workwithme.lol** | Purchased. Cloudflare nameservers (`deb.ns.cloudflare.com`, `odin.ns.cloudflare.com`). No public A/AAAA yet — Worker is not attached. | **Yes. Production domain and deploy target.** |
| **hireme.lol** | Resolves to `54.215.31.113`. HTTPS **301** → `https://lively-fog-cef0.louddrums.workers.dev/?domain=hireme.lol`, then a merch/parking page. | **No. Parked / taken. Do not buy. Do not deploy here.** |

**Do not buy or attach hireme.lol.** Travis already bought workwithme.lol. Public copy, CORS, OG, emails, Wrangler custom domains, Stripe URLs, and every deploy step use **workwithme.lol** only.

Do not purchase any other domain. `.lol` registration is dashboard-only on Cloudflare. At-cost `.lol` was recently observed around **$25.20 register / $20.20 renew** — informational only.

Likely-open names Chief saw with no public DNS (not registry-authoritative; do not buy unless Travis says so): `outwork.lol`, `bigdeal.lol`, `hirethis.lol`, `worthit.lol`, `geton.lol`, `ontheboard.lol`. Rechecked 2026-08-21: still no public A records.

---

## In v1

Public leaderboard, profile create, lightweight auth (magic link; Google/GitHub OAuth optional), public profiles, LinkedIn/website links, Stripe bidding, rank calculation, outbid events, email notifications + unsubscribe, share + OG cards, search, basic `/admin`, Turnstile, Cloudflare deploy docs, analytics hooks.

## Not in v1

Categories, cities, SMS, native apps, LinkedIn APIs, AI, résumés, recruiter dashboards, messaging, jobs.

---

## Honesty rules

- Preview / mock data must be labeled **FOUNDING PREVIEW** or **MOCK**. Never present it as live stats.
- Production launches with a real empty board.
- Refunds, webhook races, and failed bids are first-class — not an afterthought.
