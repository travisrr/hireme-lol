# AGENTS.md

Standing rules for every agent that edits `travisrr/hireme-lol`. Live site: **workwithme.lol**. Same builder only — do not open a second cloud agent on this repo.

## Ship every edit to production

After any code edit, commit and ship to production. Do not leave finished work sitting only on a feature branch. Do not push onto a side branch instead of production unless Travis explicitly says to.

Always report the commit short hash (7 characters).
Always summarize the code edits for Travis in plain language.

## Confirm the production branch (main or master)

Before you ship, verify GitHub’s default branch. It may be `main` or `master`. Do not guess. Deploy the branch production actually uses.

Also check what the live host has deployed (git SHA, Worker version, or platform deployment). Production is whatever is serving https://workwithme.lol, not whatever branch you happen to be on.

## Safety before every push

Pull or rebase first. Do not force-push. Do not rewrite shared history.

Check for concurrent work: open PRs, other `cursor/*` branches, and in-flight cloud agents. If another agent is mid-edit on the same files, wait or coordinate. Do not overwrite.

Do not merge or deploy PR 3 (`cursor/d1-bind-9d3c`) alone.

## Confirm the deploy actually landed

After push, confirm the deploy on the host that actually serves the live site. Do not assume. Check the repo and the live domain:

- Cloudflare Worker: `npm run deploy` / wrangler, then hit https://workwithme.lol and https://www.workwithme.lol and check the live Worker version.
- Vercel: the production Vercel deployment for this project.
- Anything else: whatever host is actually serving the domain.

This app is currently a Cloudflare Worker (`npm run deploy` / wrangler). It is not on Vercel unless that changes. If hosting moves later, check that host instead.

## Product locks

- Public name is **workwithme.lol** only. `hireme.lol` is not ours.
- Eight board tabs: Overall, Technology, Finance, Healthcare, Real estate, Legal, Marketing, Consulting.
- Header at 768+: How it works, Privacy, and Terms as 13px mute links, left of the 36 hug GET ON THE BOARD CTA. Below 768: wordmark left, CTA right, How it works/Privacy/Terms footer-only. Footer uses How it works · Privacy · Terms.
- `/how-it-works`, `/privacy`, and `/terms`. Contact is **hello@workwithme.lol**. Do not invent another address.
- No NEW badge in the rank gutter.
- Photos are squares with 12px radius on Trending and the board. Not circles.
- Click ints are the LinkedIn icon and the site icon, not a cursor.
- Join is Sign in with LinkedIn.
- Stripe Checkout must keep `managed_payments[enabled]=false`.
- Do not invent secrets, keys, or emails.
