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

  return (
    <section className="pt-8 pb-2">
      <p className="font-display text-base text-mute italic sm:text-lg">
        {SITE.tagline}
      </p>
      <p className="mt-4 font-mono text-[11px] tracking-wide text-mute">
        New spots start at {entry}. Paying less than the #1 price still puts you
        on the board wherever that bid lands.
      </p>
      <h1 className="mt-3 font-mono text-3xl leading-none text-paper sm:text-5xl">
        Claim #1 for{" "}
        <span className="text-paper tabular">{formatUsdFromCents(claim)}</span>
      </h1>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onAction}
          className="bg-paper px-4 py-2 font-mono text-[11px] font-semibold tracking-wide text-ink uppercase hover:bg-mute"
        >
          {SITE.cta}
        </button>
        <button
          type="button"
          onClick={onAction}
          className="border border-paper px-4 py-2 font-mono text-[11px] font-semibold tracking-wide text-paper uppercase hover:bg-paper hover:text-ink"
        >
          Outbid
        </button>
      </div>
    </section>
  );
}
