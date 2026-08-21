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
      <p className="font-display text-sm text-ink italic sm:text-base">
        {SITE.tagline}
      </p>
      <h1 className="mt-1 font-mono text-2xl leading-tight font-semibold text-ink sm:text-3xl">
        Claim #1 for{" "}
        <span className="tabular">{formatUsdFromCents(claim)}</span>
      </h1>
      <div className="mt-2.5">
        <button type="button" onClick={onAction} className="btn-accent">
          Outbid
        </button>
      </div>
      <p className="mt-2 font-mono text-[11px] text-mute">
        {entry} to enter. +{increment} to overtake.
      </p>
    </section>
  );
}
