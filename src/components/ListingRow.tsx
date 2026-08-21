import { Link } from "react-router-dom";
import { formatUsdFromCents } from "../lib/money";
import { claimPriceForRank } from "../lib/ranking";
import { isRecentBid } from "../lib/time";
import type { BidEconomics, RankedPublicListing } from "../lib/types";
import { MovementMark } from "./MovementMark";

type ListingRowProps = {
  listing: RankedPublicListing;
  board: RankedPublicListing[];
  economics: BidEconomics;
  featured?: boolean;
  onOutbid: () => void;
};

export function ListingRow({
  listing,
  board,
  economics,
  featured = false,
  onOutbid,
}: ListingRowProps) {
  const claim = claimPriceForRank(board, listing.rank, economics);
  const flash = isRecentBid(listing.currentBidAt);

  if (featured) {
    return (
      <article
        className={`flex flex-col gap-4 border border-line bg-panel px-4 py-5 sm:flex-row sm:items-center sm:gap-5 ${flash ? "bid-flash" : ""}`}
      >
        <span className="font-mono text-4xl leading-none text-paper tabular sm:w-16 sm:text-5xl">
          #{listing.rank}
        </span>
        <img
          src={listing.photoUrl}
          alt=""
          className="size-16 shrink-0 object-cover sm:size-20"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <Link
              to={`/${listing.handle}`}
              className={`${listing.rank === 1 ? "font-display text-2xl sm:text-3xl" : "font-sans text-xl font-medium"} text-paper no-underline hover:text-paper`}
            >
              {listing.displayName}
            </Link>
            <MovementMark movement={listing.movement} />
            {listing.isFoundingMember ? (
              <span className="font-mono text-[10px] text-founding uppercase">
                F100
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-sm text-mute">
            {listing.headline}
            {listing.company ? ` · ${listing.company}` : ""}
          </p>
          <p className="mt-1 font-mono text-xs text-mute">/{listing.handle}</p>
        </div>
        <div className="sm:text-right">
          <p className="font-mono text-3xl text-paper tabular sm:text-4xl">
            {formatUsdFromCents(listing.currentBidCents)}
          </p>
          <button
            type="button"
            onClick={onOutbid}
            className="mt-2 font-mono text-[11px] text-paper uppercase hover:text-paper"
          >
            claim this rank for{" "}
            <span className="text-paper tabular">{formatUsdFromCents(claim)}</span>
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`grid grid-cols-[2.25rem_2.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-line py-3 sm:grid-cols-[2.5rem_2.5rem_minmax(0,1fr)_auto_auto] ${flash ? "bid-flash" : ""}`}
    >
      <div className="flex items-center gap-1">
        <span className="font-mono text-sm text-paper tabular">{listing.rank}</span>
        <MovementMark movement={listing.movement} />
      </div>
      <img src={listing.photoUrl} alt="" className="size-9 object-cover" />
      <div className="min-w-0">
        <Link
          to={`/${listing.handle}`}
          className="truncate font-sans text-sm text-paper no-underline hover:text-paper"
        >
          {listing.displayName}
        </Link>
        <p className="truncate font-mono text-[11px] text-mute">
          /{listing.handle}
        </p>
      </div>
      <span className="font-mono text-base text-paper tabular">
        {formatUsdFromCents(listing.currentBidCents)}
      </span>
      <button
        type="button"
        onClick={onOutbid}
        className="col-span-4 justify-self-start font-mono text-[11px] text-mute uppercase hover:text-paper sm:col-span-1 sm:justify-self-end"
      >
        claim this rank for{" "}
        <span className="text-paper tabular">{formatUsdFromCents(claim)}</span>
      </button>
    </article>
  );
}
