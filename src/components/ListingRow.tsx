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
  const pitch = [listing.headline, listing.company].filter(Boolean).join(" · ");

  if (featured) {
    return (
      <article
        className={`flex flex-col gap-4 bg-panel px-4 py-5 sm:flex-row sm:items-center sm:gap-5 ${flash ? "bid-flash" : ""}`}
      >
        <span className="font-mono text-4xl leading-none text-ink tabular sm:w-16 sm:text-5xl">
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
              className="font-display text-2xl text-ink no-underline hover:text-mute sm:text-3xl"
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
          <p className="mt-1 truncate text-sm text-mute">{pitch}</p>
        </div>
        <p className="font-mono text-3xl text-ink tabular sm:text-4xl">
          {formatUsdFromCents(listing.currentBidCents)}
        </p>
        <button
          type="button"
          onClick={onOutbid}
          className="shrink-0 bg-ink px-3 py-2 font-mono text-[11px] font-semibold tracking-wide text-paper uppercase"
        >
          Outbid
        </button>
      </article>
    );
  }

  return (
    <article
      className={`grid grid-cols-[2.25rem_2.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-line py-3 sm:grid-cols-[2.5rem_2.5rem_minmax(0,1fr)_minmax(0,1fr)_auto_auto] ${flash ? "bid-flash" : ""}`}
    >
      <div className="flex items-center gap-1">
        <span className="font-mono text-sm text-ink tabular">#{listing.rank}</span>
        <MovementMark movement={listing.movement} />
      </div>
      <img src={listing.photoUrl} alt="" className="size-9 object-cover" />
      <Link
        to={`/${listing.handle}`}
        className="truncate font-sans text-sm text-ink no-underline hover:text-mute"
      >
        {listing.displayName}
      </Link>
      <p className="col-span-4 truncate text-sm text-mute sm:col-span-1">
        {listing.pitch || pitch}
      </p>
      <span className="font-mono text-base text-ink tabular">
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
