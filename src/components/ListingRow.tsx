import { Link } from "react-router-dom";
import { formatUsdFromCents } from "../lib/money";
import { claimPriceForRank } from "../lib/ranking";
import type { RankedPublicListing } from "../lib/types";
import { MovementMark } from "./MovementMark";

type ListingRowProps = {
  listing: RankedPublicListing;
  board: RankedPublicListing[];
  featured?: boolean;
  onOutbid: () => void;
};

export function ListingRow({
  listing,
  board,
  featured = false,
  onOutbid,
}: ListingRowProps) {
  const claim = claimPriceForRank(board, listing.rank);

  if (featured) {
    return (
      <article className="border border-money/40 bg-panel p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-4xl text-money tabular sm:text-5xl">
              #{listing.rank}
            </span>
            <MovementMark movement={listing.movement} />
          </div>
          <p className="font-mono text-4xl text-gold tabular sm:text-5xl">
            {formatUsdFromCents(listing.currentBidCents)}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-5 sm:flex-row">
          <img
            src={listing.photoUrl}
            alt=""
            className="h-24 w-24 rounded-sm border border-line bg-ink"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/${listing.handle}`}
                className="font-display text-3xl text-paper no-underline hover:text-money"
              >
                {listing.displayName}
              </Link>
              {listing.isFoundingMember ? (
                <span className="font-mono text-[10px] tracking-wide text-founding uppercase">
                  Founding 100
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-paper/80">
              {listing.headline}
              {listing.company ? ` · ${listing.company}` : ""}
            </p>
            <p className="mt-3 max-w-2xl text-lg text-paper">{listing.pitch}</p>
            <div className="mt-4 flex flex-wrap gap-3 font-mono text-xs">
              {listing.linkedinUrl ? (
                <a
                  href={listing.linkedinUrl}
                  className="text-mute underline hover:text-paper"
                >
                  LinkedIn
                </a>
              ) : null}
              <a
                href={listing.websiteUrl}
                className="text-mute underline hover:text-paper"
              >
                Website
              </a>
              <span className="text-mute">/{listing.handle}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="font-mono text-xs text-mute">
            Claim this rank for {formatUsdFromCents(claim)} · mock price
          </p>
          <button
            type="button"
            onClick={onOutbid}
            className="rounded-sm bg-paper px-4 py-2 font-mono text-xs font-semibold tracking-wide text-ink uppercase hover:bg-money"
          >
            Outbid
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-line py-4 sm:grid-cols-[4.5rem_3.5rem_1fr_auto_auto] sm:gap-4">
      <div className="flex items-center gap-2">
        <span className="font-mono text-lg text-money tabular">
          #{listing.rank}
        </span>
        <MovementMark movement={listing.movement} />
      </div>
      <img
        src={listing.photoUrl}
        alt=""
        className="hidden h-14 w-14 rounded-sm border border-line bg-ink sm:block"
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <Link
            to={`/${listing.handle}`}
            className="truncate font-medium text-paper no-underline hover:text-money"
          >
            {listing.displayName}
          </Link>
          {listing.isFoundingMember ? (
            <span className="font-mono text-[10px] text-founding uppercase">
              F100
            </span>
          ) : null}
        </div>
        <p className="truncate text-sm text-mute">
          {listing.headline}
          {listing.company ? ` · ${listing.company}` : ""}
        </p>
        <p className="mt-1 truncate text-sm text-paper/80">{listing.pitch}</p>
      </div>
      <p className="hidden font-mono text-lg text-gold tabular sm:block">
        {formatUsdFromCents(listing.currentBidCents)}
      </p>
      <div className="text-right">
        <p className="font-mono text-lg text-gold tabular sm:hidden">
          {formatUsdFromCents(listing.currentBidCents)}
        </p>
        <button
          type="button"
          onClick={onOutbid}
          className="mt-1 rounded-sm border border-line px-2 py-1 font-mono text-[10px] tracking-wide text-paper uppercase hover:border-money hover:text-money"
        >
          Outbid · {formatUsdFromCents(claim)}
        </button>
      </div>
    </article>
  );
}
