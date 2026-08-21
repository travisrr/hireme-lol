import { evaluateBidApply } from "./ranking";
import type { BidEconomics, BidStatus } from "./types";

export type BidRecord = {
  id: string;
  listingId: string;
  amountCents: number;
  status: BidStatus;
};

export type ListingRecord = {
  id: string;
  currentBidCents: number;
  currentBidAt: number;
  currentBidId: string | null;
};

export type BoardSnapshot = {
  listings: Record<string, ListingRecord>;
  bids: Record<string, BidRecord>;
  processedEventIds: string[];
};

export type ApplyPaymentInput = {
  eventId: string;
  bidId: string;
  listingId: string;
  amountCents: number;
  paidAt: number;
};

export type ApplyPaymentResult =
  | { outcome: "idempotent" }
  | { outcome: "confirmed"; listingId: string }
  | { outcome: "reverted"; listingId: string }
  | { outcome: "refund"; reason: "below_entry" | "not_an_overtake" | "unknown_bid" };

export function emptyBoard(): BoardSnapshot {
  return { listings: {}, bids: {}, processedEventIds: [] };
}

export function applyConfirmedPayment(
  board: BoardSnapshot,
  input: ApplyPaymentInput,
  economics: BidEconomics,
): { board: BoardSnapshot; result: ApplyPaymentResult } {
  if (board.processedEventIds.includes(input.eventId)) {
    return { board, result: { outcome: "idempotent" } };
  }

  const processedEventIds = [...board.processedEventIds, input.eventId];
  const bid = board.bids[input.bidId];
  if (!bid || bid.listingId !== input.listingId) {
    return {
      board: { ...board, processedEventIds },
      result: { outcome: "refund", reason: "unknown_bid" },
    };
  }

  const listing = board.listings[input.listingId];
  const current = listing ? listing.currentBidCents : null;
  const verdict = evaluateBidApply({
    amountCents: input.amountCents,
    listingCurrentBidCents: current,
    economics,
  });

  if (!verdict.ok) {
    return {
      board: {
        ...board,
        processedEventIds,
        bids: {
          ...board.bids,
          [bid.id]: { ...bid, status: "refunded" },
        },
      },
      result: { outcome: "refund", reason: verdict.reason },
    };
  }

  const nextListing: ListingRecord = {
    id: input.listingId,
    currentBidCents: input.amountCents,
    currentBidAt: input.paidAt,
    currentBidId: bid.id,
  };

  return {
    board: {
      listings: { ...board.listings, [input.listingId]: nextListing },
      bids: {
        ...board.bids,
        [bid.id]: { ...bid, status: "confirmed" },
      },
      processedEventIds,
    },
    result: { outcome: "confirmed", listingId: input.listingId },
  };
}

/** Two webhooks at once: apply first-wins on the same snapshot, then the loser sees the write. */
export function applyConcurrentPayments(
  board: BoardSnapshot,
  first: ApplyPaymentInput,
  second: ApplyPaymentInput,
  economics: BidEconomics,
): {
  board: BoardSnapshot;
  first: ApplyPaymentResult;
  second: ApplyPaymentResult;
} {
  const afterFirst = applyConfirmedPayment(board, first, economics);
  const afterSecond = applyConfirmedPayment(afterFirst.board, second, economics);
  return {
    board: afterSecond.board,
    first: afterFirst.result,
    second: afterSecond.result,
  };
}
