import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  confirmDevBid,
  createBid,
  fetchConfig,
  fetchMe,
  previewLinkedin,
  requestMagicLink,
  saveProfile,
} from "../api/client";
import { LinkedInMark } from "../components/LinkedInMark";
import { PhotoTile } from "../components/PhotoTile";
import { useKeyboardInset } from "../hooks/useKeyboardInset";
import { handleFromName } from "../lib/handles";
import {
  clearJoinDraft,
  emptyJoinDraft,
  readJoinDraft,
  writeJoinDraft,
  type JoinDraft,
} from "../lib/join-draft";
import { handleFromLinkedinSlug, linkedinSlug } from "../lib/linkedin";
import { formatUsdFromCents } from "../lib/money";
import { isUsableHeadshotUrl } from "../lib/photo";
import { SITE } from "../lib/site";
import { DEFAULT_ECONOMICS, type BidEconomics } from "../lib/types";
import type { SessionRow } from "../server/store";

type JoinStep = "url" | "identity" | "auth" | "bid";

export function JoinPage() {
  useKeyboardInset();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<JoinStep>("url");
  const [draft, setDraft] = useState<JoinDraft>(emptyJoinDraft);
  const [session, setSession] = useState<SessionRow | null>(null);
  const [economics, setEconomics] = useState<BidEconomics>(DEFAULT_ECONOMICS);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    const stored = readJoinDraft();
    if (stored) setDraft(stored);
    void Promise.all([fetchMe(), fetchConfig()])
      .then(([me, config]) => {
        setSession(me);
        setEconomics({
          minEntryCents: config.minEntryCents,
          minIncrementCents: config.minIncrementCents,
        });
        if (searchParams.get("signedin") === "1" && me.user && stored) {
          setStep(me.profile ? "bid" : "identity");
        }
        if (searchParams.get("paid") === "1") {
          setStep("bid");
          setDone("Payment received. Rank updates after Stripe confirms.");
          clearJoinDraft();
        }
        if (searchParams.get("canceled") === "1") {
          setStep("bid");
          setError("Checkout canceled. Bid again when you are ready.");
        }
      })
      .catch(() => {
        setSession(null);
      });
  }, [searchParams]);

  const entry = formatUsdFromCents(economics.minEntryCents);
  const increment = formatUsdFromCents(economics.minIncrementCents);

  function persist(next: JoinDraft) {
    setDraft(next);
    writeJoinDraft(next);
  }

  async function handlePull(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = String(new FormData(event.currentTarget).get("linkedinUrl") ?? "");
    setBusy(true);
    setError(null);
    try {
      const pulled = await previewLinkedin(url);
      persist({
        linkedinUrl: pulled.linkedinUrl || url.trim(),
        displayName: pulled.displayName,
        headline: pulled.headline,
        photoUrl: isUsableHeadshotUrl(pulled.photoUrl) ? pulled.photoUrl : "",
      });
      setStep("identity");
    } catch {
      persist({
        ...emptyJoinDraft(),
        linkedinUrl: url.trim(),
      });
      setStep("identity");
    } finally {
      setBusy(false);
    }
  }

  function handleIdentity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next: JoinDraft = {
      linkedinUrl: draft.linkedinUrl,
      displayName: String(form.get("displayName") ?? ""),
      headline: String(form.get("headline") ?? ""),
      photoUrl: draft.photoUrl,
    };
    persist(next);
    if (!session?.user) {
      setStep("auth");
      return;
    }
    void saveIdentity(next);
  }

  async function saveIdentity(next: JoinDraft) {
    const slug = linkedinSlug(next.linkedinUrl);
    setBusy(true);
    setError(null);
    try {
      await saveProfile({
        handle: slug ? handleFromLinkedinSlug(slug) : handleFromName(next.displayName),
        displayName: next.displayName,
        headline: next.headline,
        company: "",
        pitch: next.headline,
        photoUrl: next.photoUrl,
        linkedinUrl: next.linkedinUrl,
        websiteUrl: "",
      });
      setSession(await fetchMe());
      setStep("bid");
    } catch (err) {
      setError(err instanceof Error ? err.message : "profile_failed");
    } finally {
      setBusy(false);
    }
  }

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
        clearJoinDraft();
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
    <div className="join-sheet" data-lock="join-sheet">
      {renderStep(step, {
        draft,
        persist,
        handlePull,
        handleIdentity,
        handleMagic,
        handleBid,
        previewUrl,
        error,
        busy,
        done,
        entry,
        increment,
        displayName: session?.profile?.displayName ?? draft.displayName,
      })}
    </div>
  );
}

type SheetProps = {
  draft: JoinDraft;
  persist: (next: JoinDraft) => void;
  handlePull: (event: FormEvent<HTMLFormElement>) => void;
  handleIdentity: (event: FormEvent<HTMLFormElement>) => void;
  handleMagic: (event: FormEvent<HTMLFormElement>) => void;
  handleBid: (event: FormEvent<HTMLFormElement>) => void;
  previewUrl: string | null;
  error: string | null;
  busy: boolean;
  done: string | null;
  entry: string;
  increment: string;
  displayName: string;
};

function renderStep(step: JoinStep, props: SheetProps) {
  switch (step) {
    case "url":
      return <UrlSheet {...props} />;
    case "identity":
      return <IdentitySheet {...props} />;
    case "auth":
      return <AuthSheet {...props} />;
    case "bid":
      return <BidSheet {...props} />;
    default: {
      const _never: never = step;
      return _never;
    }
  }
}

function UrlSheet({ handlePull, busy, error }: SheetProps) {
  return (
    <>
      <main className="join-sheet-main page-gutter mx-auto flex w-full max-w-xl flex-col">
        <h1 className="type-claim text-ink">{SITE.tagline}</h1>
        <p className="type-body mt-3 text-mute">{SITE.joinPaste}</p>
        <p className="type-body mt-2 text-mute">{SITE.joinLoop}</p>
        {error ? <p className="type-body mt-4 text-down">{error}</p> : null}
        <form id="join-url" className="mt-6" onSubmit={handlePull}>
          <label className="linkedin-field">
            <span className="sr-only">LinkedIn URL</span>
            <LinkedInMark />
            <input
              name="linkedinUrl"
              inputMode="url"
              autoComplete="url"
              placeholder={SITE.linkedinPlaceholder}
            />
          </label>
        </form>
      </main>
      <div className="join-sheet-action page-gutter mx-auto w-full max-w-xl">
        <button
          form="join-url"
          type="submit"
          disabled={busy}
          className="btn-accent w-full"
        >
          {SITE.pullProfile}
        </button>
        <p className="type-meta mt-3 text-center text-mute">{SITE.joinEdit}</p>
      </div>
    </>
  );
}

function IdentitySheet({
  draft,
  handleIdentity,
  busy,
  error,
}: SheetProps) {
  return (
    <>
      <main className="join-sheet-main page-gutter mx-auto flex w-full max-w-xl flex-col">
        <h1 className="type-claim text-ink">{SITE.tagline}</h1>
        <p className="type-body mt-3 text-mute">{SITE.joinEdit}</p>
        <div className="mt-5">
          <PhotoTile src={draft.photoUrl || null} className="size-16" />
        </div>
        {error ? <p className="type-body mt-4 text-down">{error}</p> : null}
        <form id="join-identity" className="mt-5 grid gap-3" onSubmit={handleIdentity}>
          <Field
            label="Name"
            name="displayName"
            defaultValue={draft.displayName}
            placeholder="Your name"
          />
          <Field
            label="Headline"
            name="headline"
            defaultValue={draft.headline}
            placeholder="Founder, designer, operator"
          />
        </form>
      </main>
      <div className="join-sheet-action page-gutter mx-auto w-full max-w-xl">
        <button
          form="join-identity"
          type="submit"
          disabled={busy}
          className="btn-accent w-full"
        >
          Continue
        </button>
      </div>
    </>
  );
}

function AuthSheet({ handleMagic, previewUrl, busy, error, done }: SheetProps) {
  return (
    <>
      <main className="join-sheet-main page-gutter mx-auto flex w-full max-w-xl flex-col">
        <h1 className="type-claim text-ink">{SITE.tagline}</h1>
        <p className="type-body mt-3 text-mute">
          Sign in so we can attach this identity to your bid.
        </p>
        {error ? <p className="type-body mt-4 text-down">{error}</p> : null}
        {done ? <p className="type-body mt-4 text-ink">{done}</p> : null}
        <form id="join-auth" className="mt-5" onSubmit={handleMagic}>
          <Field label="Email" name="email" placeholder="you@company.com" />
        </form>
        {previewUrl ? (
          <a href={previewUrl} className="type-body mt-3 break-all text-accent">
            Local preview link (email not configured)
          </a>
        ) : null}
      </main>
      <div className="join-sheet-action page-gutter mx-auto w-full max-w-xl">
        <button
          form="join-auth"
          type="submit"
          disabled={busy}
          className="btn-accent w-full"
        >
          Email a magic link
        </button>
      </div>
    </>
  );
}

function BidSheet({
  handleBid,
  displayName,
  busy,
  error,
  done,
  entry,
  increment,
}: SheetProps) {
  return (
    <>
      <main className="join-sheet-main page-gutter mx-auto flex w-full max-w-xl flex-col">
        <h1 className="type-claim text-ink">{SITE.tagline}</h1>
        <p className="type-body mt-3 text-ink">{displayName}</p>
        <p className="type-body mt-2 text-mute">
          {entry} to enter. +{increment} to overtake.
        </p>
        {error ? <p className="type-body mt-4 text-down">{error}</p> : null}
        {done ? <p className="type-body mt-4 text-ink">{done}</p> : null}
        <form id="join-bid" className="mt-5" onSubmit={handleBid}>
          <Field label={`Bid (USD, min ${entry})`} name="bid" placeholder="2" />
        </form>
        <p className="mt-6">
          <Link to="/" className="type-body text-accent">
            ← The board
          </Link>
        </p>
      </main>
      <div className="join-sheet-action page-gutter mx-auto w-full max-w-xl">
        <button
          form="join-bid"
          type="submit"
          disabled={busy}
          className="btn-accent w-full"
        >
          Bid
        </button>
        <p className="type-meta mt-3 text-center text-mute">{SITE.footer}</p>
      </div>
    </>
  );
}

function Field({
  label,
  name,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="type-meta font-semibold text-mute uppercase">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="search-field"
      />
    </label>
  );
}
