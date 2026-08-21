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
      className={`grid grid-cols-[1.75rem_2rem_minmax(0,1fr)_auto] items-center gap-2 border-b border-line px-3 py-1.5 last:border-b-0 sm:grid-cols-[2rem_2rem_minmax(0,1fr)_minmax(0,1fr)_auto_auto] ${highlight ? "rank-wash" : ""} ${flash ? "bid-flash" : ""}`}
    >
      <div className="flex items-center gap-1">
        <span
          className={`font-mono text-xs font-medium tabular ${highlight ? "text-ink" : "text-mute"}`}
        >
          {listing.rank}
        </span>
        <MovementMark movement={listing.movement} />
      </div>
      <PhotoTile src={listing.photoUrl} />
      <Link
        to={`/${listing.handle}`}
        className="truncate font-display text-[15px] text-ink no-underline hover:text-mute"
      >
        {listing.displayName}
      </Link>
      <p className="col-span-4 truncate text-xs text-mute sm:col-span-1">
        {listing.pitch || pitch}
      </p>
      <span className="font-mono text-sm text-ink tabular">
        {formatUsdFromCents(listing.currentBidCents)}
      </span>
      <button
        type="button"
        onClick={onOutbid}
        className="justify-self-end font-mono text-[11px] text-ink uppercase hover:text-mute"
      >
        Outbid · {formatUsdFromCents(claim)}
      </button>
    </article>
  );
}
