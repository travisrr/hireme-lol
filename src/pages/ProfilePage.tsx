import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { JoinDialog } from "../components/JoinDialog";
import { MovementMark } from "../components/MovementMark";
import { PreviewBanner } from "../components/PreviewBanner";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { formatUsdFromCents } from "../lib/money";
import { claimPriceForRank } from "../lib/ranking";
import { findMockByHandle, MOCK_RANKED } from "../mock/board";

export function ProfilePage() {
  const { handle = "" } = useParams();
  const listing = findMockByHandle(handle);
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink">
      <PreviewBanner />
      <SiteHeader
        query=""
        onQueryChange={() => undefined}
        onCta={() => setJoinOpen(true)}
        showSearch={false}
      />
      <main className="mx-auto max-w-3xl px-4 py-12">
        {listing ? (
          <article>
            <p className="font-mono text-[11px] text-money uppercase">
              Mock profile · not a live listing
            </p>
            <div className="mt-4 flex items-start gap-5">
              <img
                src={listing.photoUrl}
                alt=""
                className="h-24 w-24 rounded-sm border border-line"
              />
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl text-money tabular">
                    #{listing.rank}
                  </span>
                  <MovementMark movement={listing.movement} />
                </div>
                <h1 className="mt-1 font-display text-5xl">
                  {listing.displayName}
                </h1>
                <p className="mt-2 text-mute">
                  {listing.headline}
                  {listing.company ? ` · ${listing.company}` : ""}
                </p>
              </div>
            </div>
            <p className="mt-8 text-2xl text-paper">{listing.pitch}</p>
            <p className="mt-6 font-mono text-3xl text-gold tabular">
              {formatUsdFromCents(listing.currentBidCents)}
            </p>
            <p className="mt-2 font-mono text-xs text-mute">
              Current mock bid. Claim this rank for{" "}
              {formatUsdFromCents(claimPriceForRank(MOCK_RANKED, listing.rank))}.
            </p>
            <div className="mt-6 flex gap-4 font-mono text-sm">
              {listing.linkedinUrl ? (
                <a href={listing.linkedinUrl} className="text-paper underline">
                  LinkedIn
                </a>
              ) : null}
              <a href={listing.websiteUrl} className="text-paper underline">
                Website
              </a>
            </div>
            <button
              type="button"
              onClick={() => setJoinOpen(true)}
              className="mt-8 rounded-sm bg-money px-4 py-2 font-mono text-xs font-semibold text-ink uppercase"
            >
              Outbid
            </button>
          </article>
        ) : (
          <div>
            <h1 className="font-display text-4xl">No mock profile here</h1>
            <p className="mt-3 text-mute">
              /{handle} is not in the founding-preview set. Live profiles will
              resolve from D1.
            </p>
          </div>
        )}
        <p className="mt-10">
          <Link to="/" className="font-mono text-xs text-money underline">
            ← Back to the mock board
          </Link>
        </p>
      </main>
      <SiteFooter />
      <JoinDialog open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
