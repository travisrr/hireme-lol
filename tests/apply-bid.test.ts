import { describe, expect, it } from "vitest";
import {
  applyConcurrentPayments,
  applyConfirmedPayment,
  emptyBoard,
  type BoardSnapshot,
} from "../src/lib/apply-bid";
import { rankListings } from "../src/lib/ranking";
import { DEFAULT_ECONOMICS } from "../src/lib/types";

const economics = DEFAULT_ECONOMICS;

function seeded(): BoardSnapshot {
  return {
    listings: {
      a: {
        id: "a",
        currentBidCents: 10000,
        currentBidAt: 10,
        currentBidId: "old-a",
      },
    },
    bids: {
      "bid-a2": { id: "bid-a2", listingId: "a", amountCents: 10200, status: "pending" },
      "bid-b1": { id: "bid-b1", listingId: "b", amountCents: 200, status: "pending" },
      "bid-low": { id: "bid-low", listingId: "a", amountCents: 10100, status: "pending" },
      "bid-a3": { id: "bid-a3", listingId: "a", amountCents: 10200, status: "pending" },
    },
    processedEventIds: [],
  };
}

describe("applyConfirmedPayment", () => {
  it("is idempotent on the same payment event", () => {
    const start = seeded();
    const input = {
      eventId: "evt_1",
      bidId: "bid-a2",
      listingId: "a",
      amountCents: 10200,
      paidAt: 20,
    };
    const once = applyConfirmedPayment(start, input, economics);
    const twice = applyConfirmedPayment(once.board, input, economics);
    expect(once.result).toEqual({ outcome: "confirmed", listingId: "a" });
    expect(twice.result).toEqual({ outcome: "idempotent" });
    expect(twice.board.listings.a.currentBidCents).toBe(10200);
  });

  it("refunds a raise that is not the configured increment", () => {
    const { result, board } = applyConfirmedPayment(
      seeded(),
      {
        eventId: "evt_low",
        bidId: "bid-low",
        listingId: "a",
        amountCents: 10100,
        paidAt: 20,
      },
      economics,
    );
    expect(result).toEqual({ outcome: "refund", reason: "not_an_overtake" });
    expect(board.bids["bid-low"].status).toBe("refunded");
    expect(board.listings.a.currentBidCents).toBe(10000);
  });

  it("lets a new listing enter at the configured floor while #1 is higher", () => {
    const { result, board } = applyConfirmedPayment(
      seeded(),
      {
        eventId: "evt_b",
        bidId: "bid-b1",
        listingId: "b",
        amountCents: 200,
        paidAt: 30,
      },
      economics,
    );
    expect(result.outcome).toBe("confirmed");
    expect(board.listings.b.currentBidCents).toBe(200);
    const ranked = rankListings([
      {
        id: "a",
        currentBidCents: board.listings.a.currentBidCents,
        currentBidAt: board.listings.a.currentBidAt,
        profileCreatedAt: 1,
      },
      {
        id: "b",
        currentBidCents: board.listings.b.currentBidCents,
        currentBidAt: board.listings.b.currentBidAt,
        profileCreatedAt: 2,
      },
    ]);
    expect(ranked.map((row) => row.id)).toEqual(["a", "b"]);
  });
});

describe("concurrent applies", () => {
  it("first configured raise wins; second equal raise refunds", () => {
    const { first, second, board } = applyConcurrentPayments(
      seeded(),
      {
        eventId: "evt_a",
        bidId: "bid-a2",
        listingId: "a",
        amountCents: 10200,
        paidAt: 40,
      },
      {
        eventId: "evt_c",
        bidId: "bid-a3",
        listingId: "a",
        amountCents: 10200,
        paidAt: 41,
      },
      economics,
    );
    expect(first).toEqual({ outcome: "confirmed", listingId: "a" });
    expect(second).toEqual({ outcome: "refund", reason: "not_an_overtake" });
    expect(board.listings.a.currentBidId).toBe("bid-a2");
  });

  it("does not drop the first listing when a second person joins at the floor", () => {
    const { board } = applyConcurrentPayments(
      seeded(),
      {
        eventId: "evt_a",
        bidId: "bid-a2",
        listingId: "a",
        amountCents: 10200,
        paidAt: 40,
      },
      {
        eventId: "evt_b",
        bidId: "bid-b1",
        listingId: "b",
        amountCents: 200,
        paidAt: 41,
      },
      economics,
    );
    expect(board.listings.a.currentBidCents).toBe(10200);
    expect(board.listings.b.currentBidCents).toBe(200);
    expect(board.bids["bid-a2"].status).toBe("confirmed");
    expect(board.bids["bid-b1"].status).toBe("confirmed");
  });
});

describe("empty board helper", () => {
  it("starts with no listings", () => {
    expect(emptyBoard().processedEventIds).toEqual([]);
  });
});
