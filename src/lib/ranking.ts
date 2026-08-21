import type { BidEconomics, ListingForRank, Movement, Ranked } from "./types";

export function minBidToEnter(economics: BidEconomics): number {
  return economics.minEntryCents;
}

export function minBidToOvertake(
  currentBidCents: number,
  economics: BidEconomics,
): number {
  return currentBidCents + economics.minIncrementCents;
}

/**
 * Price shown on a row: what you must pay to take that rank.
 * Empty board / rank past the last listing → entry floor.
 */
export function claimPriceForRank(
  ranked: ReadonlyArray<ListingForRank>,
  rank: number,
  economics: BidEconomics,
): number {
  if (rank < 1) {
    throw new Error("rank is 1-indexed");
  }
  if (ranked.length === 0 || rank > ranked.length) {
    return minBidToEnter(economics);
  }
  return minBidToOvertake(ranked[rank - 1].currentBidCents, economics);
}

export function compareListings(a: ListingForRank, b: ListingForRank): number {
  if (a.currentBidCents !== b.currentBidCents) {
    return b.currentBidCents - a.currentBidCents;
  }
  if (a.currentBidAt !== b.currentBidAt) {
    return a.currentBidAt - b.currentBidAt;
  }
  return a.profileCreatedAt - b.profileCreatedAt;
}

export function rankListings<T extends ListingForRank>(
  listings: readonly T[],
): Ranked<T>[] {
  return [...listings]
    .sort(compareListings)
    .map((listing, index) => ({ ...listing, rank: index + 1 }));
}

export function movementFor(
  rank: number,
  previousRank: number | null,
): Movement {
  if (previousRank === null) return "new";
  if (rank < previousRank) return "up";
  if (rank > previousRank) return "down";
  return "same";
}

export type BidApplyInput = {
  amountCents: number;
  /** Confirmed bid already on this listing, if any. */
  listingCurrentBidCents: number | null;
  economics: BidEconomics;
};

export type BidApplyResult =
  | { ok: true; kind: "enter" | "raise" }
  | { ok: false; reason: "below_entry" | "not_an_overtake" };

/**
 * Can this amount legally become the listing's new current bid?
 * Joining the board: >= configured entry.
 * Raising: at least current bid + configured increment.
 * Position vs others is computed after apply — an entry-floor bid on a
 * high board is valid and ranks last.
 */
export function evaluateBidApply(input: BidApplyInput): BidApplyResult {
  if (input.amountCents < minBidToEnter(input.economics)) {
    return { ok: false, reason: "below_entry" };
  }
  if (input.listingCurrentBidCents === null) {
    return { ok: true, kind: "enter" };
  }
  if (
    input.amountCents <
    minBidToOvertake(input.listingCurrentBidCents, input.economics)
  ) {
    return { ok: false, reason: "not_an_overtake" };
  }
  return { ok: true, kind: "raise" };
}

export function assertNever(value: never): never {
  throw new Error(`unexpected value: ${String(value)}`);
}
