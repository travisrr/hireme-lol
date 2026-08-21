import { Link, useNavigate } from "react-router-dom";
import { recordClick } from "../api/client";
import { totalClicks } from "../lib/clicks";
import { formatUsdFromCents } from "../lib/money";
import { claimPriceForRank } from "../lib/ranking";
import { SITE } from "../lib/site";
import { isRecentBid } from "../lib/time";
import type { BidEconomics, RankedPublicListing } from "../lib/types";
import { ClickStat } from "./ClickStat";
import { MovementMark } from "./MovementMark";
import { PhotoTile } from "./PhotoTile";

export const TOP_TEN_CUTOFF = 10;
export const ROW_MIN_PX = 72;
export const PHOTO_PX = 44;
export const OUTBID_MIN_PX = 32;

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
      className={`listing-row ${highlight ? "rank-wash" : "bg-card"} ${flash ? "bid-flash" : ""}`}
    >
      <div className="flex items-center gap-1">
        <span
          className={`type-rank ${highlight ? "text-accent" : "text-mute"}`}
        >
          {listing.rank}
        </span>
        <MovementMark movement={listing.movement} />
      </div>
      <PhotoTile src={listing.photoUrl} />
      <button
        type="button"
        onClick={() => {
          void openProfile();
        }}
        className="min-w-0 text-left"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[15px] font-semibold text-ink hover:text-accent">
            {listing.displayName}
          </span>
          {listing.isFoundingMember ? (
            <span className="shrink-0 text-[9px] font-bold tracking-wide text-accent uppercase">
              Founding
            </span>
          ) : null}
        </span>
        <span className="type-meta mt-0.5 flex min-w-0 items-center gap-2 text-mute">
          <span className="truncate">{listing.pitch || pitch}</span>
          <ClickStat count={totalClicks(listing)} />
        </span>
      </button>
      <div className="flex flex-col items-end justify-center gap-1">
        <span className="type-rank text-accent">
          {formatUsdFromCents(listing.currentBidCents)}
        </span>
        <Link
          to="/join"
          className="btn-outbid"
          aria-label={`${SITE.outbid} ${formatUsdFromCents(claim)}`}
        >
          {SITE.outbid}
        </Link>
      </div>
    </article>
  );
}
