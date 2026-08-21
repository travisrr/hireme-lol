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
    <section className="pt-6 pb-1">
      <p className="text-base font-medium text-ink sm:text-lg">{SITE.tagline}</p>
      <h1 className="mt-2 text-3xl leading-tight font-extrabold text-ink sm:text-5xl">
        Claim #1 for{" "}
        <span className="text-accent tabular">{formatUsdFromCents(claim)}</span>
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onAction} className="btn-accent">
          {SITE.cta}
        </button>
        <button type="button" onClick={onAction} className="btn-accent">
          Outbid
        </button>
      </div>
      <p className="mt-3 text-sm text-mute">
        {entry} to enter. +{increment} to overtake.
      </p>
    </section>
  );
}
