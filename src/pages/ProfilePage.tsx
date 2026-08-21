import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchBoard, fetchConfig, fetchProfile } from "../api/client";
import { JoinDialog } from "../components/JoinDialog";
import { MovementMark } from "../components/MovementMark";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { toPublicListing } from "../lib/board-view";
import { formatUsdFromCents } from "../lib/money";
import { claimPriceForRank } from "../lib/ranking";
import { photoFallback } from "../lib/photo";
import { shareLine } from "../lib/share";
import { DEFAULT_ECONOMICS, type BidEconomics } from "../lib/types";
import type { RankedBoardRow } from "../server/store";

export function ProfilePage() {
  const { handle = "" } = useParams();
  const [joinOpen, setJoinOpen] = useState(false);
  const [missing, setMissing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ranked, setRanked] = useState<RankedBoardRow | null>(null);
  const [board, setBoard] = useState<RankedBoardRow[]>([]);
  const [economics, setEconomics] = useState<BidEconomics>(DEFAULT_ECONOMICS);
  const [profile, setProfile] = useState<{
    displayName: string;
    headline: string;
    company: string | null;
    pitch: string;
    photoUrl: string | null;
    linkedinUrl: string | null;
    websiteUrl: string | null;
    handle: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchProfile(handle), fetchBoard(), fetchConfig()])
      .then(([found, live, config]) => {
        if (cancelled) return;
        setProfile(found.profile);
        setRanked(found.ranked);
        setBoard(live.listings);
        setEconomics({
          minEntryCents: config.minEntryCents,
          minIncrementCents: config.minIncrementCents,
        });
        setMissing(false);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  const listing = ranked ? toPublicListing(ranked) : null;

  return (
    <div className="min-h-screen bg-ink">
      <SiteHeader
        query=""
        onQueryChange={() => undefined}
        onCta={() => setJoinOpen(true)}
        showSearch={false}
      />
      <main className="mx-auto max-w-3xl px-4 py-12">
        {profile ? (
          <article>
            <p className="font-mono text-[11px] text-paper uppercase">
              Public profile · /{profile.handle}
            </p>
            <div className="mt-4 flex items-start gap-5">
              <img
                src={profile.photoUrl || photoFallback(profile.handle)}
                alt=""
                className="size-24 object-cover"
              />
              <div>
                {listing ? (
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-3xl text-paper tabular">
                      #{listing.rank}
                    </span>
                    <MovementMark movement={listing.movement} />
                  </div>
                ) : (
                  <p className="font-mono text-xs text-mute">Not on the board yet</p>
                )}
                <h1 className="mt-1 font-display text-5xl">
                  {profile.displayName}
                </h1>
                <p className="mt-2 text-mute">
                  {profile.headline}
                  {profile.company ? ` · ${profile.company}` : ""}
                </p>
              </div>
            </div>
            <p className="mt-8 text-2xl text-paper">{profile.pitch}</p>
            {listing ? (
              <>
                <p className="mt-6 font-mono text-3xl text-paper tabular">
                  {formatUsdFromCents(listing.currentBidCents)}
                </p>
                <p className="mt-2 font-mono text-xs text-mute">
                  Current bid. Claim this rank for{" "}
                  {formatUsdFromCents(
                    claimPriceForRank(
                      board.map((row) => ({
                        id: row.listingId,
                        currentBidCents: row.currentBidCents,
                        currentBidAt: row.currentBidAt,
                        profileCreatedAt: row.profileCreatedAt,
                      })),
                      listing.rank,
                      economics,
                    ),
                  )}
                  .
                </p>
                <button
                  type="button"
                  className="mt-4 font-mono text-[11px] text-paper uppercase"
                  onClick={() => {
                    void navigator.clipboard.writeText(shareLine(listing.rank));
                    setCopied(true);
                  }}
                >
                  {copied ? "Copied" : "Copy share line"}
                </button>
              </>
            ) : null}
            <div className="mt-6 flex gap-4 font-mono text-sm">
              {profile.linkedinUrl ? (
                <a href={profile.linkedinUrl} className="text-paper underline">
                  LinkedIn
                </a>
              ) : null}
              {profile.websiteUrl ? (
                <a href={profile.websiteUrl} className="text-paper underline">
                  Website
                </a>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setJoinOpen(true)}
              className="mt-8 bg-paper px-4 py-2 font-mono text-xs font-semibold text-ink uppercase"
            >
              Outbid
            </button>
          </article>
        ) : (
          <div>
            <h1 className="font-display text-4xl">
              {missing ? "No profile here" : "Loading…"}
            </h1>
            {missing ? (
              <p className="mt-3 text-mute">
                /{handle} is not on workwithme.lol.
              </p>
            ) : null}
          </div>
        )}
        <p className="mt-10">
          <Link to="/" className="font-mono text-xs text-paper underline">
            ← Back to the board
          </Link>
        </p>
      </main>
      <SiteFooter />
      <JoinDialog
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onChanged={() => undefined}
      />
    </div>
  );
}
