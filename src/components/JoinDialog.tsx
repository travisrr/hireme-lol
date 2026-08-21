import { useEffect, useState, type FormEvent } from "react";
import {
  confirmDevBid,
  createBid,
  fetchConfig,
  fetchMe,
  requestMagicLink,
  saveProfile,
} from "../api/client";
import { formatUsdFromCents } from "../lib/money";
import { SITE } from "../lib/site";
import { DEFAULT_ECONOMICS, type BidEconomics } from "../lib/types";
import type { SessionRow } from "../server/store";

type JoinDialogProps = {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
};

export function JoinDialog({ open, onClose, onChanged }: JoinDialogProps) {
  const [session, setSession] = useState<SessionRow | null>(null);
  const [oauth, setOauth] = useState({ github: false, google: false });
  const [economics, setEconomics] = useState<BidEconomics>(DEFAULT_ECONOMICS);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
      setError(null);
      setDone(null);
      return;
    }
    void Promise.all([fetchMe(), fetchConfig()])
      .then(([me, config]) => {
        setSession(me);
        setOauth(config.oauth);
        setEconomics({
          minEntryCents: config.minEntryCents,
          minIncrementCents: config.minIncrementCents,
        });
      })
      .catch(() => {
        setSession(null);
      });
  }, [open]);

  if (!open) return null;

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

  async function handleProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await saveProfile({
        handle: String(form.get("handle") ?? ""),
        displayName: String(form.get("displayName") ?? ""),
        headline: String(form.get("headline") ?? ""),
        company: String(form.get("company") ?? ""),
        pitch: String(form.get("pitch") ?? ""),
        photoUrl: String(form.get("photoUrl") ?? ""),
        linkedinUrl: String(form.get("linkedinUrl") ?? ""),
        websiteUrl: String(form.get("websiteUrl") ?? ""),
      });
      setSession(await fetchMe());
      onChanged();
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
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      if (result.devConfirm) {
        await confirmDevBid(result.bidId, amountCents);
        setDone("Local test payment confirmed. You are on the board.");
        onChanged();
        return;
      }
      setDone("Bid created. Waiting on Stripe.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "bid_failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-[12px] border border-line bg-card p-5 shadow-2xl">
        <p className="text-xs font-semibold text-mute uppercase">
          Live board · one-time bid · {SITE.name}
        </p>
        <h2 className="mt-2 text-2xl font-bold">{SITE.cta}</h2>
        <p className="mt-2 text-sm text-mute">
          Entry {entry}. {increment} to overtake. Stripe is authoritative. No
          fake listings.
        </p>
        {error ? (
          <p className="mt-3 text-sm text-down">{error}</p>
        ) : null}
        {done ? (
          <p className="mt-4 text-sm text-ink">{done}</p>
        ) : !session?.user ? (
          <div className="mt-5 grid gap-3">
            <form className="grid gap-3" onSubmit={handleMagic}>
              <Field label="Email" name="email" placeholder="you@company.com" />
              <button type="submit" disabled={busy} className="btn-accent">
                Email a magic link
              </button>
            </form>
            {previewUrl ? (
              <a href={previewUrl} className="break-all text-sm text-accent">
                Local preview link (email not configured)
              </a>
            ) : null}
            <div className="flex gap-3 text-sm">
              {oauth.github ? (
                <a href="/api/auth/github" className="text-accent">
                  GitHub
                </a>
              ) : null}
              {oauth.google ? (
                <a href="/api/auth/google" className="text-accent">
                  Google
                </a>
              ) : null}
            </div>
          </div>
        ) : !session.profile ? (
          <form className="mt-5 grid gap-3" onSubmit={handleProfile}>
            <Field label="Name" name="displayName" placeholder="Your name" />
            <Field label="Handle" name="handle" placeholder="maya" />
            <Field
              label="Headline"
              name="headline"
              placeholder="Staff product designer"
            />
            <Field label="Company" name="company" placeholder="Independent" />
            <Field
              label="One-line pitch"
              name="pitch"
              placeholder="What should someone remember?"
            />
            <Field
              label="Website"
              name="websiteUrl"
              placeholder="https://"
            />
            <Field
              label="LinkedIn"
              name="linkedinUrl"
              placeholder="https://linkedin.com/in/…"
            />
            <Field
              label="Photo URL"
              name="photoUrl"
              placeholder="https://… (you supply it)"
            />
            <button type="submit" disabled={busy} className="btn-accent">
              Save profile
            </button>
          </form>
        ) : (
          <form className="mt-5 grid gap-3" onSubmit={handleBid}>
            <p className="text-sm text-mute">
              Signed in as {session.user.email} · /{session.profile.handle}
            </p>
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
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-sm text-mute underline"
        >
          Close
        </button>
      </div>
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
        className="rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-mute focus:border-accent"
      />
    </label>
  );
}
