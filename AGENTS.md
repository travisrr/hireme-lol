# AGENTS.md

Standing rules for every agent that edits `travisrr/hireme-lol`. Live site: **workwithme.lol**. Same builder only — do not open a second cloud agent on this repo.

## Ship every edit

After any code edit, commit and ship to production. Do not leave finished work sitting only on a feature branch.

Before you ship, verify GitHub’s default branch is `main` (not `master`). Also check the live Cloudflare Worker. Do not guess. Deploy the branch production actually uses.

This app is a Cloudflare Worker (`npm run deploy` / wrangler). It is not on Vercel unless that changes. After push, confirm the deploy landed: hit https://workwithme.lol and https://www.workwithme.lol, and check the live Worker version. If hosting moves later, check that host instead.

Always report the commit short hash (7 characters).
Always summarize the code edits for Travis in plain language.

## Safety before every push

Pull or rebase first. Do not force-push. Do not rewrite shared history.

Check for concurrent work: open PRs, other `cursor/*` branches, and in-flight cloud agents. If another agent is mid-edit on the same files, wait or coordinate. Do not overwrite.

Do not merge or deploy PR 3 (`cursor/d1-bind-9d3c`) alone.

## Product locks

- Public name is **workwithme.lol** only. `hireme.lol` is not ours.
- Eight board tabs: Overall, Technology, Finance, Healthcare, Real estate, Legal, Marketing, Consulting.
- Header: Privacy and Terms as 13px mute links, left of the 36 hug GET ON THE BOARD CTA. Footer uses the same Privacy · Terms links.
- `/privacy` and `/terms`. Contact is **hello@workwithme.lol**. Do not invent another address.
- No NEW badge in the rank gutter.
- Join is Sign in with LinkedIn.
- Stripe Checkout must keep `managed_payments[enabled]=false`.
- Do not invent secrets, keys, or emails.
