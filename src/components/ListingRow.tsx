import { Link, useNavigate } from "react-router-dom";
import { recordClick } from "../api/client";
import { initialsFromName, totalClicks } from "../lib/clicks";
import { formatUsdFromCents } from "../lib/money";
import { claimPriceForRank } from "../lib/ranking";
import { isRecentBid } from "../lib/time";
import type { BidEconomics, RankedPublicListing } from "../lib/types";
import { ClickStat } from "./ClickStat";
import { MovementMark } from "./MovementMark";
import { PhotoTile } from "./PhotoTile";

export const TOP_TEN_CUTOFF = 10;

type ListingRowProps = {
  listing: RankedPublicListing;
  board: RankedPublicListing[];
  economics: BidEconomics;
};

export function ListingRow({ listing, board, economics }: ListingRowProps) {
  const navigate = useNavigate();
  const claim = claimPriceForRank(board, listing.rank, economics);
  const flash = isRecentBid(listing.currentBidAt);
  const highlight = listing.rank <= TOP_TEN_CUTOFF;
  const pitch = [listing.headline, listing.company].filter(Boolean).join(" · ");

  async function openProfile() {
    try {
      await recordClick(listing.id, "profile");
    } catch {
      // Still go through. Count is best-effort.
    }
    navigate(`/${listing.handle}`);
  }

  return (
    <article
      className={`grid h-14 grid-cols-[2rem_2rem_minmax(0,1fr)_auto] items-center gap-2 border-b border-line px-3 last:border-b-0 sm:grid-cols-[2.25rem_2rem_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto] ${highlight ? "rank-wash" : "bg-card"} ${flash ? "bid-flash" : ""}`}
    >
      <div className="flex items-center gap-1">
        <span
          className={`text-sm font-bold tabular ${highlight ? "text-accent" : "text-mute"}`}
        >
          {listing.rank}
        </span>
        <MovementMark movement={listing.movement} />
      </div>
      <PhotoTile
        src={listing.photoUrl}
        initials={initialsFromName(listing.displayName)}
      />
      <button
        type="button"
        onClick={() => {
          void openProfile();
        }}
        className="min-w-0 truncate text-left text-[15px] font-semibold text-ink hover:text-accent"
      >
        {listing.displayName}
        {listing.isFoundingMember ? (
          <span className="ml-1.5 align-middle text-[9px] font-bold tracking-wide text-accent uppercase">
            Founding
          </span>
        ) : null}
      </button>
      <p className="col-span-4 hidden truncate text-xs text-mute sm:col-span-1 sm:block">
        {listing.pitch || pitch}
      </p>
      <ClickStat count={totalClicks(listing)} />
      <span className="text-sm font-bold text-accent tabular">
        {formatUsdFromCents(listing.currentBidCents)}
      </span>
      <Link
        to="/join"
        className="justify-self-end text-[11px] font-semibold text-accent uppercase no-underline hover:text-accent-hover"
      >
        Outbid · {formatUsdFromCents(claim)}
      </Link>
    </article>
  );
}
