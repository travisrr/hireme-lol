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
      <p className="text-base font-medium text-ink">{SITE.tagline}</p>
      <h1 className="mt-2 text-3xl leading-tight font-extrabold text-ink sm:text-4xl">
        Claim <span className="text-accent">#1</span> for{" "}
        <span className="text-accent tabular">{formatUsdFromCents(claim)}</span>
      </h1>
      <div className="mt-4">
        <button type="button" onClick={onAction} className="btn-accent px-5 py-2.5">
          Outbid
        </button>
      </div>
      <p className="mt-3 text-sm text-mute">
        {entry} to enter. +{increment} to overtake.
      </p>
    </section>
  );
}
