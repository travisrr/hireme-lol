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
    <div className="min-h-screen bg-paper">
      <SiteHeader
        query=""
        onQueryChange={() => undefined}
        onCta={() => setJoinOpen(true)}
        showSearch={false}
      />
      <main className="mx-auto max-w-3xl px-4 py-12">
        {profile ? (
          <article>
            <p className="text-xs font-semibold text-mute uppercase">
              Public profile · /{profile.handle}
            </p>
            <div className="mt-4 flex items-start gap-5">
              <img
                src={profile.photoUrl || photoFallback(profile.handle)}
                alt=""
                className="size-24 rounded-[12px] object-cover"
              />
              <div>
                {listing ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-accent tabular">
                      {listing.rank}
                    </span>
                    <MovementMark movement={listing.movement} />
                  </div>
                ) : (
                  <p className="text-sm text-mute">Not on the board yet</p>
                )}
                <h1 className="mt-1 text-4xl font-extrabold">
                  {profile.displayName}
                </h1>
                <p className="mt-2 text-mute">
                  {profile.headline}
                  {profile.company ? ` · ${profile.company}` : ""}
                </p>
              </div>
            </div>
            <p className="mt-8 text-2xl text-ink">{profile.pitch}</p>
            {listing ? (
              <>
                <p className="mt-6 text-3xl font-extrabold text-accent tabular">
                  {formatUsdFromCents(listing.currentBidCents)}
                </p>
                <p className="mt-2 text-sm text-mute">
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
                  className="mt-4 text-sm font-semibold text-accent"
                  onClick={() => {
                    void navigator.clipboard.writeText(shareLine(listing.rank));
                    setCopied(true);
                  }}
                >
                  {copied ? "Copied" : "Copy share line"}
                </button>
              </>
            ) : null}
            <div className="mt-6 flex gap-4 text-sm">
              {profile.linkedinUrl ? (
                <a href={profile.linkedinUrl}>LinkedIn</a>
              ) : null}
              {profile.websiteUrl ? (
                <a href={profile.websiteUrl}>Website</a>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setJoinOpen(true)}
              className="btn-accent mt-8"
            >
              Outbid
            </button>
          </article>
        ) : (
          <div>
            <h1 className="text-4xl font-extrabold">
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
          <Link to="/" className="text-sm">
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
