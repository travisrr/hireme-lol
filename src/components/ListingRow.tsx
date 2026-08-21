import { Link } from "react-router-dom";
import { formatUsdFromCents } from "../lib/money";
import { claimPriceForRank } from "../lib/ranking";
import { isRecentBid } from "../lib/time";
import type { BidEconomics, RankedPublicListing } from "../lib/types";
import { MovementMark } from "./MovementMark";

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
      className={`grid grid-cols-[2rem_2.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0 sm:grid-cols-[2.25rem_2.25rem_minmax(0,1fr)_minmax(0,1fr)_auto_auto] ${highlight ? "rank-wash" : ""} ${flash ? "bid-flash" : ""}`}
    >
      <div className="flex items-center gap-1">
        <span
          className={`text-sm font-bold tabular ${highlight ? "text-accent" : "text-ink"}`}
        >
          {listing.rank}
        </span>
        <MovementMark movement={listing.movement} />
      </div>
      <img
        src={listing.photoUrl}
        alt=""
        className="size-9 rounded-[12px] object-cover"
      />
      <Link
        to={`/${listing.handle}`}
        className="truncate text-sm font-semibold text-ink no-underline hover:text-accent"
      >
        {listing.displayName}
      </Link>
      <p className="col-span-4 truncate text-sm text-mute sm:col-span-1">
        {listing.pitch || pitch}
      </p>
      <span className="text-sm font-bold text-accent tabular">
        {formatUsdFromCents(listing.currentBidCents)}
      </span>
      <button
        type="button"
        onClick={onOutbid}
        className="justify-self-end text-sm font-semibold text-accent hover:text-accent-hover"
      >
        Outbid · {formatUsdFromCents(claim)}
      </button>
    </article>
  );
}
