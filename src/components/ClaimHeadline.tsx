import { formatUsdFromCents } from "../lib/money";
import { claimPriceForRank, minBidToEnter } from "../lib/ranking";
import { SITE } from "../lib/site";
import type { BidEconomics, ListingForRank } from "../lib/types";

type ClaimHeadlineProps = {
  board: readonly ListingForRank[];
  economics: BidEconomics;
  onAction: () => void;
};

export function ClaimHeadline({
  board,
  economics,
  onAction,
}: ClaimHeadlineProps) {
  const claim = claimPriceForRank(board, 1, economics);
  const entry = formatUsdFromCents(minBidToEnter(economics));
  const increment = formatUsdFromCents(economics.minIncrementCents);

  return (
    <section className="min-w-0">
      <p className="text-sm font-medium text-ink sm:text-base">{SITE.tagline}</p>
      <h1 className="mt-1 text-2xl leading-tight font-extrabold text-ink sm:text-3xl">
        Claim #1 for{" "}
        <span className="text-accent tabular">{formatUsdFromCents(claim)}</span>
      </h1>
      <div className="mt-3">
        <button type="button" onClick={onAction} className="btn-accent">
          Outbid
        </button>
      </div>
      <p className="mt-2 text-sm text-mute">
        {entry} to enter. +{increment} to overtake.
      </p>
    </section>
  );
}
