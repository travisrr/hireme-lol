import { Link, useNavigate } from "react-router-dom";
import { recordClick } from "../api/client";
import { formatUsdFromCents } from "../lib/money";
import { claimPriceForRank } from "../lib/ranking";
import { SITE } from "../lib/site";
import { isRecentBid } from "../lib/time";
import type { BidEconomics, RankedPublicListing } from "../lib/types";
import { ClickStat } from "./ClickStat";
import { PHOTO_RADIUS_PX, PhotoTile } from "./PhotoTile";

export const TOP_TEN_CUTOFF = 10;
export const ROW_MIN_PX = 56;
export const ROW_MIN_MOBILE_PX = 72;
export const PHOTO_PX = 40;
export const PHOTO_MOBILE_PX = 40;
export const PHOTO_RADIUS = PHOTO_RADIUS_PX;
export const RANK_COL_PX = 28;
export const RANK_COL_MOBILE_PX = 24;
export const OUTBID_MIN_PX = 32;
export const NAME_MIN_CH = 12;

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
      <PhotoTile
        src={listing.photoUrl}
        className="listing-photo"
        radius={PHOTO_RADIUS}
      />
      <button
        type="button"
        onClick={() => {
          void openProfile();
        }}
        className="listing-who"
      >
        <span className="listing-name text-ink hover:text-accent">
          {listing.displayName}
        </span>
        <span className="listing-meta">
          {listing.isFoundingMember ? (
            <span className="listing-founding">FOUNDING</span>
          ) : pitch ? (
            <span className="listing-headline">{pitch}</span>
          ) : null}
          <ClickStat
            listingId={listing.id}
            linkedinClicks={listing.linkedinClicks}
            websiteClicks={listing.websiteClicks}
            linkedinUrl={listing.linkedinUrl}
            websiteUrl={listing.websiteUrl}
          />
        </span>
      </button>
      <div className="listing-bid">
        <span className="listing-price type-rank text-accent">
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
