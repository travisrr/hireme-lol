import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  confirmDevBid,
  createBid,
  fetchBoard,
  fetchConfig,
  fetchMe,
  logout,
  saveProfile,
  uploadPhoto,
} from "../api/client";
import { LinkedInMark } from "../components/LinkedInMark";
import { PhotoTile } from "../components/PhotoTile";
import { SiteFooter } from "../components/SiteFooter";
import { ThemeToggle } from "../components/ThemeToggle";
import { useKeyboardInset } from "../hooks/useKeyboardInset";
import { handleFromName } from "../lib/handles";
import {
  INDUSTRIES,
  MAX_CATEGORIES,
  parseCategories,
  type IndustryId,
} from "../lib/industries";
import {
  clearJoinDraft,
  emptyJoinDraft,
  readJoinDraft,
  writeJoinDraft,
  type JoinDraft,
} from "../lib/join-draft";
import { joinStepFromServer, type JoinOauthProfile } from "../lib/join-gate";
import { PAGE_COLUMN } from "../lib/measure";
import {
  centsToDollarString,
  clampOutbidDollars,
  formatUsdFromCents,
  parseBidAmountCents,
} from "../lib/money";
import { isUsableHeadshotUrl } from "../lib/photo";
import {
  belowMinMessage,
  publicErrorMessage,
  TITLE_REQUIRED,
} from "../lib/public-error";
import { minOutbidCents } from "../lib/ranking";
import { linkedinShareIntent, shareLine } from "../lib/share";
import { SITE } from "../lib/site";
import { DEFAULT_ECONOMICS, type BidEconomics } from "../lib/types";
import type { SessionRow } from "../server/store";

type JoinStep = "signin" | "identity" | "share";

export function JoinPage() {
  useKeyboardInset();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<JoinStep>("signin");
  const [draft, setDraft] = useState<JoinDraft>(emptyJoinDraft);
  const [session, setSession] = useState<SessionRow | null>(null);
  const [economics, setEconomics] = useState<BidEconomics>(DEFAULT_ECONOMICS);
  const [minBidCents, setMinBidCents] = useState(DEFAULT_ECONOMICS.minEntryCents);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchMe(), fetchConfig(), fetchBoard()])
      .then(async ([me, config, board]) => {
        if (cancelled) return;
        const nextEconomics = {
          minEntryCents: config.minEntryCents,
          minIncrementCents: config.minIncrementCents,
        };
        setEconomics(nextEconomics);
        setMinBidCents(
          minOutbidCents(board.listings[0]?.currentBidCents, nextEconomics),
        );
        const oauth = (me as SessionRow & { oauthProfile?: JoinOauthProfile })
          .oauthProfile;
        const nextStep = joinStepFromServer({
          hasUser: Boolean(me.user),
          oauthProfile: oauth,
          share: searchParams.get("share") === "1",
          paid: searchParams.get("paid") === "1",
        });
        switch (nextStep) {
          case "share":
            setSession(me);
            setStep("share");
            setRank(Number(searchParams.get("rank") || 0) || null);
            if (searchParams.get("share") === "1") clearJoinDraft();
            return;
          case "signin":
            clearJoinDraft();
            setDraft(emptyJoinDraft());
            setSession(null);
            setStep("signin");
            if (me.user) {
              try {
                await logout();
              } catch {
                // LinkedIn wall still shows.
              }
            }
            if (searchParams.get("oauth") === "off") {
              setError(publicErrorMessage("oauth_not_configured"));
            }
            return;
          case "identity": {
            setSession(me);
            const stored = readJoinDraft();
            if (oauth) {
              const next = {
                ...(stored ?? emptyJoinDraft()),
                displayName: oauth.displayName || stored?.displayName || "",
                photoUrl: oauth.photoUrl || stored?.photoUrl || "",
                headline: stored?.headline || oauth.headline || "",
                linkedinUrl: stored?.linkedinUrl || oauth.linkedinUrl || "",
              };
              setDraft(next);
              writeJoinDraft(next);
            }
            if (searchParams.get("canceled") === "1") {
              setError("Checkout canceled. Bid again when you are ready.");
            }
            setStep("identity");
            return;
          }
          default: {
            const _never: never = nextStep;
            return _never;
          }
        }
      })
      .catch(() => {
        if (cancelled) return;
        clearJoinDraft();
        setDraft(emptyJoinDraft());
        setSession(null);
        setStep("signin");
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    if (step !== "share" || rank != null) return;
    let cancelled = false;
    const tick = async () => {
      const me = await fetchMe();
      if (!me.profile) return;
      const board = await fetchBoard();
      const row = board.listings.find((item) => item.handle === me.profile?.handle);
      if (!cancelled && row) setRank(row.rank);
    };
    void tick();
    const id = window.setInterval(() => {
      void tick();
    }, 1500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [rank, step]);

  function persist(next: JoinDraft) {
    setDraft(next);
    writeJoinDraft(next);
  }

  async function handleIdentityBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next: JoinDraft = {
      linkedinUrl: draft.linkedinUrl,
      displayName: String(form.get("displayName") ?? ""),
      headline: String(form.get("headline") ?? ""),
      photoUrl: isUsableHeadshotUrl(String(form.get("photoUrl") ?? draft.photoUrl))
        ? String(form.get("photoUrl") ?? draft.photoUrl)
        : draft.photoUrl,
      websiteUrl: String(form.get("websiteUrl") ?? ""),
      categories: parseCategories(form.getAll("category")),
    };
    persist(next);
    if (!next.displayName.trim()) {
      setError("Add your name.");
      return;
    }
    if (!next.headline.trim()) {
      setError(TITLE_REQUIRED);
      return;
    }
    if (next.categories.length === 0) {
      setError("Pick an industry so you show on that tab.");
      return;
    }
    const dollars = String(form.get("bid") ?? "");
    const amountCents = parseBidAmountCents(dollars, minBidCents);
    if (amountCents == null || amountCents < minBidCents) {
      setError(belowMinMessage(minBidCents));
      return;
    }
    if (!session?.user) {
      setError(publicErrorMessage("unauthorized"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let photoUrl = next.photoUrl;
      if (photoFile) {
        const uploaded = await uploadPhoto(photoFile);
        photoUrl = uploaded.photoUrl;
        persist({ ...next, photoUrl });
      }
      await saveProfile({
        handle: handleFromName(next.displayName),
        displayName: next.displayName,
        headline: next.headline,
        company: "",
        pitch: next.headline,
        photoUrl,
        linkedinUrl: next.linkedinUrl,
        websiteUrl: next.websiteUrl,
        industry: next.categories[0] ?? null,
        categories: next.categories,
      });
      setSession(await fetchMe());
      const result = await createBid(amountCents);
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      const local =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      if (result.devConfirm && local) {
        await confirmDevBid(result.bidId, amountCents);
        clearJoinDraft();
        setRank(null);
        setStep("share");
        return;
      }
      setError(publicErrorMessage("payments_not_ready"));
    } catch (err) {
      setError(publicErrorMessage(err instanceof Error ? err.message : "bid_failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <div
        className="join-frame flex-1"
        data-lock={step === "share" ? "share-sheet" : "join-sheet"}
      >
        <div className="join-top">
          <Link
            to="/"
            className="type-wordmark text-accent no-underline hover:text-accent-hover"
          >
            {SITE.wordmark}
          </Link>
          <ThemeToggle />
        </div>
        {step === "signin" ? (
          <div className={`join-lock ${PAGE_COLUMN}`}>
            <SignInCard error={error} />
            <WhyTakeCard />
          </div>
        ) : step === "identity" ? (
          <IdentityBidCard
            draft={draft}
            onSubmit={handleIdentityBid}
            photoFile={photoFile}
            onPhotoFile={setPhotoFile}
            busy={busy}
            error={error}
            minCents={minBidCents}
            incrementCents={economics.minIncrementCents}
          />
        ) : (
          <ShareCard
            displayName={session?.profile?.displayName ?? draft.displayName}
            rank={rank}
            copied={copied}
            copyShare={async () => {
              await navigator.clipboard.writeText(shareLine(rank ?? 1));
              setCopied(true);
            }}
            linkedinHref={linkedinShareIntent(shareLine(rank ?? 1))}
          />
        )}
      </div>
      <SiteFooter />
    </div>
  );
}

function WhyTakeCard() {
  return (
    <section className="join-card join-why">
      <h2 className="join-why-title">{SITE.joinWhyTitle}</h2>
      <ul className="join-why-list">
        {SITE.joinWhyBullets.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

function SignInCard({ error }: { error: string | null }) {
  return (
    <section className="join-card">
      <h1 className="type-claim text-ink">{SITE.tagline}</h1>
      <p className="type-body mt-3 text-mute">{SITE.joinSignIn}</p>
      <p className="type-body mt-2 text-mute">{SITE.joinLoop}</p>
      {error ? <p className="type-body mt-4 text-down">{error}</p> : null}
      <p className="mt-6">
        <a href="/api/auth/linkedin" className="btn-linkedin no-underline">
          <LinkedInMark tone="onAccent" />
          {SITE.linkedinCta}
        </a>
      </p>
      <p className="join-signin-foot type-meta text-mute">{SITE.joinApprove}</p>
    </section>
  );
}

function IdentityBidCard({
  draft,
  onSubmit,
  photoFile,
  onPhotoFile,
  busy,
  error,
  minCents,
  incrementCents,
}: {
  draft: JoinDraft;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  photoFile: File | null;
  onPhotoFile: (file: File | null) => void;
  busy: boolean;
  error: string | null;
  minCents: number;
  incrementCents: number;
}) {
  const [picked, setPicked] = useState<IndustryId[]>(draft.categories);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!photoFile) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  function toggleCategory(id: IndustryId, on: boolean) {
    setPicked((current) => {
      if (on) {
        if (current.includes(id) || current.length >= MAX_CATEGORIES) {
          return current;
        }
        return [...current, id];
      }
      return current.filter((item) => item !== id);
    });
  }

  return (
    <section className="join-card join-card-wide">
      <h1 className="type-claim text-ink">{SITE.tagline}</h1>
      <p className="type-body mt-3 text-mute">{SITE.joinApprove}</p>
      <div className="mt-5 flex justify-center">
        <PhotoTile src={filePreview || draft.photoUrl || null} className="size-16" />
      </div>
      {error ? <p className="type-body mt-4 text-down">{error}</p> : null}
      <form className="mt-5 grid gap-3 text-left" onSubmit={onSubmit}>
        <Field
          label="Name"
          name="displayName"
          defaultValue={draft.displayName}
          placeholder="Your name"
          required
        />
        <Field
          label="Title"
          name="headline"
          defaultValue={draft.headline}
          placeholder="Your title"
          required
        />
        <Field
          label="Website"
          name="websiteUrl"
          defaultValue={draft.websiteUrl}
          placeholder="yourcompany.com"
        />
        <fieldset className="grid gap-2">
          <legend className="type-meta font-semibold text-mute uppercase">
            Categories (up to {MAX_CATEGORIES})
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {INDUSTRIES.map((item) => {
              const checked = picked.includes(item.id);
              return (
                <label key={item.id} className="flex min-h-11 items-center gap-2">
                  <input
                    type="checkbox"
                    name="category"
                    value={item.id}
                    checked={checked}
                    disabled={!checked && picked.length >= MAX_CATEGORIES}
                    onChange={(event) => toggleCategory(item.id, event.target.checked)}
                  />
                  <span className="type-body text-ink">{item.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <label className="grid gap-1">
          <span className="type-meta font-semibold text-mute uppercase">
            Or upload a photo
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="search-field min-h-12 py-2"
            onChange={(event) => onPhotoFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <BidAmountField minCents={minCents} incrementCents={incrementCents} />
        <button type="submit" disabled={busy} className="btn-accent mt-2 w-full">
          {SITE.cta}
        </button>
      </form>
    </section>
  );
}

function ShareCard({
  displayName,
  rank,
  copied,
  copyShare,
  linkedinHref,
}: {
  displayName: string;
  rank: number | null;
  copied: boolean;
  copyShare: () => void;
  linkedinHref: string;
}) {
  return (
    <section className="join-card">
      <h1 className="type-claim text-ink">{SITE.tagline}</h1>
      <p className="type-body mt-3 text-ink">{displayName}</p>
      <p className="type-body mt-2 text-mute">
        {rank != null
          ? shareLine(rank)
          : "Payment received. Rank updates after Stripe confirms."}
      </p>
      <button
        type="button"
        disabled={rank == null}
        onClick={copyShare}
        className="btn-accent mt-6 w-full"
      >
        {copied ? "Copied" : "Share your bid"}
      </button>
      <a
        href={linkedinHref}
        target="_blank"
        rel="noreferrer"
        className="btn-accent mt-3 inline-flex w-full no-underline"
      >
        Share on LinkedIn
      </a>
      <p className="mt-4">
        <Link to="/" className="type-body text-accent">
          ← The board
        </Link>
      </p>
    </section>
  );
}

function BidAmountField({
  minCents,
  incrementCents,
}: {
  minCents: number;
  incrementCents: number;
}) {
  const minDollars = minCents / 100;
  const step = incrementCents / 100;
  const [dollars, setDollars] = useState(centsToDollarString(minCents));

  useEffect(() => {
    setDollars((current) => {
      const parsed = parseBidAmountCents(current, minCents);
      if (parsed == null || parsed < minCents) return centsToDollarString(minCents);
      return current;
    });
  }, [minCents]);

  function applyRaw(raw: string) {
    setDollars(clampOutbidDollars(raw, minCents));
  }

  return (
    <label className="grid gap-1">
      <span className="type-meta font-semibold text-mute uppercase">
        Bid (USD, min {formatUsdFromCents(minCents)})
      </span>
      <input
        name="bid"
        type="number"
        inputMode="decimal"
        min={minDollars}
        step={step}
        value={dollars}
        required
        className="search-field"
        onChange={(event) => applyRaw(event.target.value)}
        onBlur={() => {
          const parsed = parseBidAmountCents(dollars, minCents);
          setDollars(
            centsToDollarString(
              parsed == null || parsed < minCents ? minCents : parsed,
            ),
          );
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown") return;
          const parsed = parseBidAmountCents(dollars, minCents);
          if (parsed == null || parsed <= minCents) {
            event.preventDefault();
            setDollars(centsToDollarString(minCents));
          }
        }}
      />
    </label>
  );
}

function Field({
  label,
  name,
  placeholder,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  placeholder: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1">
      <span className="type-meta font-semibold text-mute uppercase">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="search-field"
      />
    </label>
  );
}
