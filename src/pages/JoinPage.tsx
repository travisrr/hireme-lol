import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  confirmDevBid,
  createBid,
  fetchConfig,
  fetchMe,
  requestMagicLink,
  saveProfile,
} from "../api/client";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { handleFromName } from "../lib/handles";
import { handleFromLinkedinSlug, linkedinSlug } from "../lib/linkedin";
import { formatUsdFromCents } from "../lib/money";
import { openPaddleCheckout } from "../lib/paddle-js";
import { SITE } from "../lib/site";
import { DEFAULT_ECONOMICS, type BidEconomics } from "../lib/types";
import type { SessionRow } from "../server/store";

export function JoinPage() {
  const [session, setSession] = useState<SessionRow | null>(null);
  const [economics, setEconomics] = useState<BidEconomics>(DEFAULT_ECONOMICS);
  const [paddle, setPaddle] = useState<{
    clientToken: string | null;
    environment: "sandbox" | "production";
  }>({ clientToken: null, environment: "sandbox" });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([fetchMe(), fetchConfig()])
      .then(([me, config]) => {
        setSession(me);
        setEconomics({
          minEntryCents: config.minEntryCents,
          minIncrementCents: config.minIncrementCents,
        });
        setPaddle({
          clientToken: config.paddleClientToken,
          environment: config.paddleEnvironment,
        });
      })
      .catch(() => {
        setSession(null);
      });
  }, []);

  const entry = formatUsdFromCents(economics.minEntryCents);
  const increment = formatUsdFromCents(economics.minIncrementCents);

  async function handleMagic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    setBusy(true);
    setError(null);
    try {
      const result = await requestMagicLink(email);
      setPreviewUrl(result.previewUrl ?? null);
      if (!result.previewUrl) {
        setDone("Check your email for the sign-in link.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "magic_failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleIdentity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") ?? "");
    const headline = String(form.get("headline") ?? "");
    const linkedinUrl = String(form.get("linkedinUrl") ?? "");
    const websiteUrl = String(form.get("websiteUrl") ?? "");
    const slug = linkedinSlug(linkedinUrl);
    setBusy(true);
    setError(null);
    try {
      await saveProfile({
        handle: slug ? handleFromLinkedinSlug(slug) : handleFromName(displayName),
        displayName,
        headline,
        company: "",
        pitch: headline,
        photoUrl: "",
        linkedinUrl,
        websiteUrl,
      });
      setSession(await fetchMe());
    } catch (err) {
      setError(err instanceof Error ? err.message : "profile_failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dollars = String(new FormData(event.currentTarget).get("bid") ?? "");
    const amountCents = Math.round(Number(dollars) * 100);
    setBusy(true);
    setError(null);
    try {
      const result = await createBid(amountCents);
      if (paddle.clientToken && result.transactionId) {
        await openPaddleCheckout({
          clientToken: paddle.clientToken,
          transactionId: result.transactionId,
          environment: paddle.environment,
        });
        setDone("Checkout opened. Rank updates after Paddle confirms payment.");
        return;
      }
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      if (result.devConfirm) {
        await confirmDevBid(result.bidId, amountCents);
        setDone("Local test payment confirmed. You are on the board.");
        return;
      }
      setDone("Bid created. Waiting on Paddle.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "bid_failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader query="" onQueryChange={() => undefined} showSearch={false} />
      <main className="mx-auto max-w-xl px-4 py-8">
        <p className="text-xs font-semibold text-accent uppercase">
          {SITE.name}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">{SITE.cta}</h1>
        <p className="mt-3 text-base text-ink">{SITE.joinLead}</p>
        <ul className="mt-3 grid gap-1.5 text-sm text-mute">
          <li>{SITE.joinEntry}</li>
          <li>{SITE.joinRepeat}</li>
          <li>{SITE.joinRule}</li>
          <li>
            {entry} to enter. +{increment} to overtake.
          </li>
        </ul>
        {error ? <p className="mt-4 text-sm text-down">{error}</p> : null}
        {done ? <p className="mt-4 text-sm text-ink">{done}</p> : null}
        {!session?.user ? (
          <form className="mt-6 grid gap-3" onSubmit={handleMagic}>
            <Field label="Email" name="email" placeholder="you@company.com" />
            <button type="submit" disabled={busy} className="btn-accent">
              Email a magic link
            </button>
            {previewUrl ? (
              <a href={previewUrl} className="break-all text-sm text-accent">
                Local preview link (email not configured)
              </a>
            ) : null}
          </form>
        ) : !session.profile ? (
          <form className="mt-6 grid gap-3" onSubmit={handleIdentity}>
            <Field label="Name" name="displayName" placeholder="Your name" />
            <Field
              label="Headline"
              name="headline"
              placeholder="Founder, designer, operator"
            />
            <Field
              label="LinkedIn URL"
              name="linkedinUrl"
              placeholder="https://www.linkedin.com/in/you"
            />
            <Field
              label="Website (optional)"
              name="websiteUrl"
              placeholder="https://"
            />
            <p className="text-xs text-mute">
              Photo upload later. Placeholder avatar is fine.
            </p>
            <button type="submit" disabled={busy} className="btn-accent">
              Save identity
            </button>
          </form>
        ) : (
          <form className="mt-6 grid gap-3" onSubmit={handleBid}>
            <p className="text-sm text-ink">
              {session.profile.displayName}
              {session.profile.headline ? ` · ${session.profile.headline}` : ""}
            </p>
            <p className="text-sm text-mute">{SITE.joinRepeat}</p>
            <Field
              label={`Bid (USD, min ${entry})`}
              name="bid"
              placeholder="2"
            />
            <button type="submit" disabled={busy} className="btn-accent">
              Bid
            </button>
          </form>
        )}
        <p className="mt-8">
          <Link to="/" className="text-sm text-accent">
            ← The board
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-semibold text-mute uppercase">{label}</span>
      <input
        name={name}
        placeholder={placeholder}
        className="rounded-xl border border-line bg-card px-3 py-2 text-sm text-ink outline-none placeholder:text-mute focus:border-accent"
      />
    </label>
  );
}
