import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { fetchBoard, fetchConfig, fetchProfile } from "../api/client";
import { ProfileOutboundLinks } from "../components/ClickStat";
import { MovementMark } from "../components/MovementMark";
import { PhotoTile } from "../components/PhotoTile";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { toPublicListing } from "../lib/board-view";
import { formatUsdFromCents } from "../lib/money";
import { publicPhotoSrc } from "../lib/photo";
import { claimPriceForRank } from "../lib/ranking";
import { SETTINGS_NAV, SETTINGS_PATH } from "../lib/settings";
import { shareLine } from "../lib/share";
import { DEFAULT_ECONOMICS, type BidEconomics } from "../lib/types";
import type { RankedBoardRow } from "../server/store";

export function ProfilePage() {
  const { handle = "" } = useParams();
  const [searchParams] = useSearchParams();
  const [missing, setMissing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [ranked, setRanked] = useState<RankedBoardRow | null>(null);
  const [board, setBoard] = useState<RankedBoardRow[]>([]);
  const [economics, setEconomics] = useState<BidEconomics>(DEFAULT_ECONOMICS);
  const [profile, setProfile] = useState<{
    displayName: string;
    headline: string;
    company: string | null;
    pitch: string;
    bio: string;
    photoUrl: string | null;
    linkedinUrl: string | null;
    websiteUrl: string | null;
    handle: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchProfile(handle, searchParams.get("from")),
      fetchBoard(),
      fetchConfig(),
    ])
      .then(([found, live, config]) => {
        if (cancelled) return;
        if (!found.profile) {
          setMissing(true);
          return;
        }
        setProfile({
          displayName: found.profile.displayName,
          headline: found.profile.headline,
          company: found.profile.company,
          pitch: found.profile.pitch,
          bio: found.profile.bio ?? "",
          photoUrl: found.profile.photoUrl,
          linkedinUrl: found.profile.linkedinUrl,
          websiteUrl: found.profile.websiteUrl,
          handle: found.profile.handle,
        });
        setRanked(found.ranked);
        setIsOwner(found.isOwner);
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
  }, [handle, searchParams]);

  const listing = ranked ? toPublicListing(ranked) : null;

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader
        query=""
        onQueryChange={() => undefined}
        showSearch={false}
      />
      <main className="page-gutter mx-auto max-w-3xl py-12">
        {profile ? (
          <article>
            <p className="text-xs font-semibold text-mute uppercase">
              Public profile · /{profile.handle}
            </p>
            {isOwner ? (
              <p className="mt-2">
                <Link to={SETTINGS_PATH} className="text-sm font-semibold text-accent">
                  {SETTINGS_NAV}
                </Link>
              </p>
            ) : null}
            <div className="mt-4 flex items-start gap-5">
              <PhotoTile
                src={publicPhotoSrc(profile.photoUrl)}
                className="size-24"
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
                <ProfileOutboundLinks
                  listingId={listing?.id}
                  linkedinUrl={profile.linkedinUrl}
                  websiteUrl={profile.websiteUrl}
                />
              </div>
            </div>
            <p className="mt-8 text-2xl text-ink">{profile.pitch}</p>
            {profile.bio ? (
              <div className="profile-bio mt-6">{profile.bio}</div>
            ) : null}
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
                        shareCreditCents: row.shareCreditCents,
                      })),
                      listing.rank,
                      economics,
                    ),
                  )}
                  .
                </p>
              </>
            ) : null}
            <div className={listing ? "profile-actions" : "mt-8"}>
              {listing ? (
                <button
                  type="button"
                  className="text-sm font-semibold text-accent"
                  onClick={() => {
                    void navigator.clipboard.writeText(shareLine(listing.rank));
                    setCopied(true);
                  }}
                >
                  {copied ? "Copied" : "Copy share line"}
                </button>
              ) : null}
              <Link to="/join" className="btn-accent no-underline">
                Outbid
              </Link>
            </div>
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
    </div>
  );
}
