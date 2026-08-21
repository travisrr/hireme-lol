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
    <section className="px-2 pt-10 pb-4 text-center">
      <p className="font-display text-lg text-ink italic sm:text-xl">
        {SITE.tagline}
      </p>
      <h1 className="mt-4 font-mono text-4xl leading-[0.95] font-semibold text-ink sm:text-6xl">
        Claim #1 for{" "}
        <span className="tabular">{formatUsdFromCents(claim)}</span>
      </h1>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onAction}
          className="bg-ink px-4 py-2 font-mono text-[11px] font-semibold tracking-wide text-paper uppercase"
        >
          {SITE.cta}
        </button>
        <button
          type="button"
          onClick={onAction}
          className="bg-ink px-4 py-2 font-mono text-[11px] font-semibold tracking-wide text-paper uppercase"
        >
          Outbid
        </button>
      </div>
      <p className="mt-4 font-mono text-[11px] text-mute">
        {entry} to enter. +{increment} to overtake.
      </p>
    </section>
  );
}
