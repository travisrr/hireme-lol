import { Link } from "react-router-dom";
import { formatUsdFromCents } from "../lib/money";
import { claimPriceForRank, minBidToEnter } from "../lib/ranking";
import { SITE } from "../lib/site";
import type { BidEconomics, ListingForRank } from "../lib/types";

type ClaimHeadlineProps = {
  board: readonly ListingForRank[];
  economics: BidEconomics;
};

export function ClaimHeadline({ board, economics }: ClaimHeadlineProps) {
  const claim = claimPriceForRank(board, 1, economics);
  const entry = formatUsdFromCents(minBidToEnter(economics));
  const increment = formatUsdFromCents(economics.minIncrementCents);

  return (
    <section className="min-w-0">
      <p className="type-claim text-ink">{SITE.tagline}</p>
      <h1 className="type-claim mt-2 text-ink">
        Claim #1 for{" "}
        <span className="type-price text-accent">
          {formatUsdFromCents(claim)}
        </span>
      </h1>
      <div className="mt-4">
        <Link to="/join" className="btn-accent w-full no-underline">
          {SITE.outbid}
        </Link>
      </div>
      <p className="type-body mt-3 text-mute">
        {entry} to enter. +{increment} to overtake.
      </p>
    </section>
  );
}
