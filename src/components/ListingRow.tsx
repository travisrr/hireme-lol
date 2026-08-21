import { Link } from "react-router-dom";
import { formatUsdFromCents } from "../lib/money";
import { claimPriceForRank } from "../lib/ranking";
import { isRecentBid } from "../lib/time";
import type { BidEconomics, RankedPublicListing } from "../lib/types";
import { MovementMark } from "./MovementMark";
import { PhotoTile } from "./PhotoTile";

export const TOP_TEN_CUTOFF = 10;

type ListingRowProps = {
  listing: RankedPublicListing;
  board: RankedPublicListing[];
  economics: BidEconomics;
  onOutbid: () => void;
};

export function ListingRow({
  listing,
  board,
  economics,
  onOutbid,
}: ListingRowProps) {
  const claim = claimPriceForRank(board, listing.rank, economics);
  const flash = isRecentBid(listing.currentBidAt);
  const highlight = listing.rank <= TOP_TEN_CUTOFF;
  const pitch = [listing.headline, listing.company].filter(Boolean).join(" · ");

  return (
    <article
      className={`grid h-14 grid-cols-[2rem_2rem_minmax(0,1fr)_auto] items-center gap-2 border-b border-line px-3 last:border-b-0 sm:grid-cols-[2.25rem_2rem_minmax(0,1fr)_minmax(0,1fr)_auto_auto] ${highlight ? "rank-wash" : "bg-card"} ${flash ? "bid-flash" : ""}`}
    >
      <div className="flex items-center gap-1">
        <span
          className={`text-sm font-bold tabular ${highlight ? "text-accent" : "text-mute"}`}
        >
          {listing.rank}
        </span>
        <MovementMark movement={listing.movement} />
      </div>
      <PhotoTile src={listing.photoUrl} />
      <Link
        to={`/${listing.handle}`}
        className="truncate text-[15px] font-semibold text-ink no-underline hover:text-accent"
      >
        {listing.displayName}
      </Link>
      <p className="col-span-4 truncate text-xs text-mute sm:col-span-1">
        {listing.pitch || pitch}
      </p>
      <span className="text-sm font-bold text-accent tabular">
        {formatUsdFromCents(listing.currentBidCents)}
      </span>
      <button
        type="button"
        onClick={onOutbid}
        className="justify-self-end text-[11px] font-semibold text-accent uppercase hover:text-accent-hover"
      >
        Outbid · {formatUsdFromCents(claim)}
      </button>
    </article>
  );
}
