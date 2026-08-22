import { useEffect, useState, type ClipboardEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { fetchConfig, fetchMe, fetchMyListing, saveListingPage } from "../api/client";
import { LinkedInMark } from "../components/LinkedInMark";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { BIO_MAX_CHARS, normalizeBio } from "../lib/bio";
import { PAGE_COLUMN } from "../lib/measure";
import { formatUsdFromCents } from "../lib/money";
import { publicErrorMessage } from "../lib/public-error";
import {
  listingShareText,
  listingShareUrl,
  platformShareHref,
  SHARE_PLATFORMS,
  shareJuice,
  type ShareJuice,
  type SharePlatform,
} from "../lib/share-rank";
import {
  SETTINGS_BIO_HINT,
  SETTINGS_DOCUMENT_TITLE,
  SETTINGS_JUICE_LEAD,
  SETTINGS_JUICE_TITLE,
  SETTINGS_LEAD,
  SETTINGS_NEED_PROFILE,
  SETTINGS_OFF_BOARD,
  SETTINGS_SAVED,
  SETTINGS_SIGN_IN,
  SETTINGS_TITLE,
  settingsJuiceRules,
} from "../lib/settings";
import { SITE } from "../lib/site";
import { DEFAULT_ECONOMICS } from "../lib/types";
import type { RankedBoardRow } from "../server/store";

const PLATFORM_LABEL: Record<SharePlatform, string> = {
  linkedin: "LinkedIn",
  x: "X",
  facebook: "Facebook",
  threads: "Threads",
  copy: "Copy link",
};

type Gate = "loading" | "signin" | "join" | "ready";

export function SettingsPage() {
  const [gate, setGate] = useState<Gate>("loading");
  const [company, setCompany] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [bio, setBio] = useState("");
  const [handle, setHandle] = useState("");
  const [ranked, setRanked] = useState<RankedBoardRow | null>(null);
  const [onBoard, setOnBoard] = useState(false);
  const [juice, setJuice] = useState<ShareJuice>(shareJuice(0));
  const [incrementCents, setIncrementCents] = useState(
    DEFAULT_ECONOMICS.minIncrementCents,
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const previous = document.title;
    document.title = SETTINGS_DOCUMENT_TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchMe(), fetchConfig()])
      .then(async ([me, config]) => {
        if (cancelled) return;
        setIncrementCents(config.minIncrementCents);
        if (!me.user) {
          setGate("signin");
          return;
        }
        if (!me.profile) {
          setGate("join");
          return;
        }
        const listing = await fetchMyListing();
        if (cancelled) return;
        setHandle(listing.profile.handle);
        setCompany(listing.profile.company ?? "");
        setWebsiteUrl(listing.profile.websiteUrl ?? "");
        setBio(listing.profile.bio ?? "");
        setRanked(listing.ranked);
        setOnBoard(listing.onBoard);
        setJuice(listing.juice);
        setGate("ready");
      })
      .catch(() => {
        if (!cancelled) setGate("signin");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function onBioPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = event.clipboardData.getData("text/plain");
    if (!pasted) return;
    event.preventDefault();
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const next = normalizeBio(
      `${target.value.slice(0, start)}${pasted}${target.value.slice(end)}`,
    );
    setBio(next);
  }

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const result = await saveListingPage({
        company,
        websiteUrl,
        bio: normalizeBio(bio),
      });
      setCompany(result.profile.company ?? "");
      setWebsiteUrl(result.profile.websiteUrl ?? "");
      setBio(result.profile.bio ?? "");
      setSaved(true);
    } catch (err) {
      setError(
        publicErrorMessage(err instanceof Error ? err.message : "profile_failed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyShareLink() {
    if (!handle) return;
    const rank = ranked?.rank ?? 1;
    await navigator.clipboard.writeText(
      listingShareText(rank, handle, "copy"),
    );
    setCopied(true);
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className={`page-gutter mx-auto ${PAGE_COLUMN}`}>
        <SiteHeader
          query=""
          onQueryChange={() => undefined}
          showSearch={false}
          inColumn
        />
        <main data-lock="settings" className="settings-page pb-8 pt-4">
          <div className="settings-doc">
            <header className="settings-hero">
              <h1 className="settings-title">{SETTINGS_TITLE}</h1>
              <p className="settings-lead">{SETTINGS_LEAD}</p>
            </header>

            {gate === "loading" ? (
              <p className="type-body text-mute">Loading…</p>
            ) : null}

            {gate === "signin" ? (
              <section className="settings-card">
                <p className="type-body text-ink">{SETTINGS_SIGN_IN}</p>
                <p className="mt-5">
                  <a href="/api/auth/linkedin" className="btn-linkedin no-underline">
                    <LinkedInMark tone="onAccent" />
                    {SITE.linkedinCta}
                  </a>
                </p>
              </section>
            ) : null}

            {gate === "join" ? (
              <section className="settings-card">
                <p className="type-body text-ink">{SETTINGS_NEED_PROFILE}</p>
                <Link to="/join" className="btn-accent mt-5 inline-block no-underline">
                  {SITE.cta}
                </Link>
              </section>
            ) : null}

            {gate === "ready" ? (
              <>
                <form className="settings-card grid gap-3" onSubmit={onSave}>
                  {error ? <p className="type-body text-down">{error}</p> : null}
                  {saved ? (
                    <p className="type-body text-accent">{SETTINGS_SAVED}</p>
                  ) : null}
                  <label className="grid gap-1">
                    <span className="type-meta font-semibold text-mute uppercase">
                      Company
                    </span>
                    <input
                      name="company"
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                      placeholder="Your company"
                      className="search-field"
                      autoComplete="organization"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="type-meta font-semibold text-mute uppercase">
                      Company website
                    </span>
                    <input
                      name="websiteUrl"
                      value={websiteUrl}
                      onChange={(event) => setWebsiteUrl(event.target.value)}
                      placeholder="yourcompany.com"
                      inputMode="url"
                      autoComplete="url"
                      className="search-field"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="type-meta font-semibold text-mute uppercase">
                      Bio
                    </span>
                    <textarea
                      name="bio"
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      onPaste={onBioPaste}
                      rows={10}
                      maxLength={BIO_MAX_CHARS}
                      spellCheck
                      placeholder="Who you are, what you do, why someone should work with you."
                      className="settings-bio"
                    />
                    <span className="type-meta text-mute">
                      {SETTINGS_BIO_HINT} {bio.length}/{BIO_MAX_CHARS}
                    </span>
                  </label>
                  <button type="submit" disabled={busy} className="btn-accent mt-2">
                    Save
                  </button>
                  {handle ? (
                    <p className="type-meta text-mute">
                      Public page:{" "}
                      <Link to={`/${handle}`} className="text-accent">
                        /{handle}
                      </Link>
                    </p>
                  ) : null}
                </form>

                <section className="settings-card settings-juice">
                  <h2 className="settings-heading">{SETTINGS_JUICE_TITLE}</h2>
                  <p className="type-body text-ink">{SETTINGS_JUICE_LEAD}</p>
                  <p className="type-body mt-2 text-mute">
                    {settingsJuiceRules(incrementCents)}
                  </p>
                  {onBoard && ranked ? (
                    <>
                      <p className="settings-juice-stat">
                        You’re #{ranked.rank}. {juice.countedVisits} of{" "}
                        {juice.maxPoints} unique opens this week ·{" "}
                        {formatUsdFromCents(juice.creditCents)} juice
                        {juice.creditCents >= juice.maxCreditCents
                          ? " (cap hit)"
                          : ""}
                        .
                      </p>
                      <div
                        className="settings-meter"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={juice.maxPoints}
                        aria-valuenow={juice.countedVisits}
                        aria-label="Share juice this week"
                      >
                        <span
                          style={{
                            width: `${(juice.countedVisits / juice.maxPoints) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="settings-share-row">
                        {SHARE_PLATFORMS.map((platform) => {
                          const url = listingShareUrl(handle, platform);
                          const text = listingShareText(
                            ranked.rank,
                            handle,
                            platform,
                          );
                          const href = platformShareHref(platform, text, url);
                          if (platform === "copy" || !href) {
                            return (
                              <button
                                key={platform}
                                type="button"
                                className="settings-share-btn"
                                onClick={() => {
                                  void copyShareLink();
                                }}
                              >
                                {copied ? "Copied" : PLATFORM_LABEL.copy}
                              </button>
                            );
                          }
                          return (
                            <a
                              key={platform}
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="settings-share-btn no-underline"
                            >
                              {PLATFORM_LABEL[platform]}
                            </a>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="type-body mt-3 text-mute">{SETTINGS_OFF_BOARD}</p>
                  )}
                </section>
              </>
            ) : null}
          </div>
        </main>
        <SiteFooter inColumn />
      </div>
    </div>
  );
}
