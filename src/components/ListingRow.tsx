import { Link, useNavigate } from "react-router-dom";
import { recordClick } from "../api/client";
import { totalClicks } from "../lib/clicks";
import { formatUsdFromCents } from "../lib/money";
import { claimPriceForRank } from "../lib/ranking";
import { SITE } from "../lib/site";
import { isRecentBid } from "../lib/time";
import type { BidEconomics, RankedPublicListing } from "../lib/types";
import { ClickStat } from "./ClickStat";
import { PHOTO_RADIUS_PX, PhotoTile } from "./PhotoTile";

export const TOP_TEN_CUTOFF = 10;
export const ROW_MIN_PX = 56;
export const PHOTO_PX = 44;
export const PHOTO_RADIUS = PHOTO_RADIUS_PX;
export const RANK_COL_PX = 28;
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
  const pitch = listing.headline || listing.pitch || listing.company || "";

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
      <span
        className={`listing-rank ${highlight ? "text-accent" : "text-mute"}`}
      >
        {listing.rank}
      </span>
      <PhotoTile src={listing.photoUrl} radius={PHOTO_RADIUS} />
      <button
        type="button"
        onClick={() => {
          void openProfile();
        }}
        className="listing-who"
      >
        <span className="truncate text-[15px] font-semibold text-ink hover:text-accent">
          {listing.displayName}
        </span>
        {listing.isFoundingMember ? (
          <span className="shrink-0 text-[9px] font-bold tracking-wide text-accent uppercase">
            FOUNDING
          </span>
        ) : null}
        <span className="type-meta min-w-0 truncate text-mute">{pitch}</span>
        <ClickStat count={totalClicks(listing)} />
      </button>
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
    </article>
  );
}
