import { describe, expect, it } from "vitest";
import { formatUsdFromCents, parseDollarInput } from "../src/lib/money";
import {
  claimPriceForRank,
  compareListings,
  evaluateBidApply,
  minBidToEnter,
  minBidToOvertake,
  movementFor,
  rankListings,
} from "../src/lib/ranking";
import { LAUNCH_ECONOMICS, type ListingForRank } from "../src/lib/types";

function listing(
  partial: Partial<ListingForRank> & Pick<ListingForRank, "id">,
): ListingForRank {
  return {
    currentBidCents: 500,
    currentBidAt: 1_000,
    profileCreatedAt: 1_000,
    ...partial,
  };
}

describe("launch economics", () => {
  it("does not drift from $5 entry / +$1 overtake", () => {
    expect(LAUNCH_ECONOMICS.minEntryCents).toBe(500);
    expect(LAUNCH_ECONOMICS.minIncrementCents).toBe(100);
    expect(minBidToEnter()).toBe(500);
    expect(minBidToOvertake(500)).toBe(600);
    expect(minBidToOvertake(240000)).toBe(240100);
  });
});

describe("rankListings", () => {
  it("orders by highest bid first", () => {
    const ranked = rankListings([
      listing({ id: "a", currentBidCents: 500 }),
      listing({ id: "b", currentBidCents: 1500 }),
      listing({ id: "c", currentBidCents: 900 }),
    ]);
    expect(ranked.map((row) => row.id)).toEqual(["b", "c", "a"]);
    expect(ranked.map((row) => row.rank)).toEqual([1, 2, 3]);
  });

  it("breaks equal bids with earliest timestamp at that amount", () => {
    const ranked = rankListings([
      listing({ id: "later", currentBidCents: 5000, currentBidAt: 200 }),
      listing({ id: "earlier", currentBidCents: 5000, currentBidAt: 100 }),
    ]);
    expect(ranked[0].id).toBe("earlier");
    expect(ranked[1].id).toBe("later");
  });

  it("breaks remaining ties with earlier profile created_at", () => {
    const ranked = rankListings([
      listing({
        id: "new-profile",
        currentBidCents: 5000,
        currentBidAt: 50,
        profileCreatedAt: 9_000,
      }),
      listing({
        id: "old-profile",
        currentBidCents: 5000,
        currentBidAt: 50,
        profileCreatedAt: 1_000,
      }),
    ]);
    expect(ranked[0].id).toBe("old-profile");
    expect(ranked[1].id).toBe("new-profile");
  });

  it("is deterministic across shuffle", () => {
    const rows = [
      listing({ id: "a", currentBidCents: 800, currentBidAt: 3, profileCreatedAt: 1 }),
      listing({ id: "b", currentBidCents: 800, currentBidAt: 2, profileCreatedAt: 9 }),
      listing({ id: "c", currentBidCents: 900, currentBidAt: 8, profileCreatedAt: 2 }),
    ];
    const once = rankListings(rows).map((row) => row.id);
    const twice = rankListings([...rows].reverse()).map((row) => row.id);
    expect(once).toEqual(["c", "b", "a"]);
    expect(twice).toEqual(once);
  });
});

describe("evaluateBidApply", () => {
  it("rejects anything under $5", () => {
    expect(evaluateBidApply({ amountCents: 499, listingCurrentBidCents: null })).toEqual({
      ok: false,
      reason: "below_entry",
    });
  });

  it("lets a $5 bid enter even if #1 is huge", () => {
    expect(evaluateBidApply({ amountCents: 500, listingCurrentBidCents: null })).toEqual({
      ok: true,
      kind: "enter",
    });
  });

  it("requires +$1 to raise your own listing", () => {
    expect(
      evaluateBidApply({ amountCents: 10000, listingCurrentBidCents: 10000 }),
    ).toEqual({ ok: false, reason: "not_an_overtake" });
    expect(
      evaluateBidApply({ amountCents: 10100, listingCurrentBidCents: 10000 }),
    ).toEqual({ ok: true, kind: "raise" });
  });
});

describe("claimPriceForRank", () => {
  it("is entry floor on an empty board", () => {
    expect(claimPriceForRank([], 1)).toBe(500);
  });

  it("is occupant + $1 for an occupied rank", () => {
    const ranked = rankListings([
      listing({ id: "top", currentBidCents: 240000 }),
      listing({ id: "two", currentBidCents: 10000 }),
    ]);
    expect(claimPriceForRank(ranked, 1)).toBe(240100);
    expect(claimPriceForRank(ranked, 2)).toBe(10100);
    expect(claimPriceForRank(ranked, 3)).toBe(500);
  });
});

describe("movementFor", () => {
  it("labels new, up, down, same", () => {
    expect(movementFor(1, null)).toBe("new");
    expect(movementFor(1, 4)).toBe("up");
    expect(movementFor(5, 2)).toBe("down");
    expect(movementFor(3, 3)).toBe("same");
  });
});

describe("compareListings is a total order", () => {
  it("never returns zero for distinct ids with same keys except created_at", () => {
    const a = listing({ id: "a", profileCreatedAt: 1 });
    const b = listing({ id: "b", profileCreatedAt: 2 });
    expect(compareListings(a, b)).toBeLessThan(0);
    expect(compareListings(b, a)).toBeGreaterThan(0);
  });
});

describe("money", () => {
  it("formats cents without forcing .00 on whole dollars", () => {
    expect(formatUsdFromCents(500)).toBe("$5");
    expect(formatUsdFromCents(240000)).toBe("$2,400");
    expect(formatUsdFromCents(181500)).toBe("$1,815");
    expect(formatUsdFromCents(101)).toBe("$1.01");
  });

  it("parses dollar input", () => {
    expect(parseDollarInput("$12")).toBe(1200);
    expect(parseDollarInput("12.50")).toBe(1250);
    expect(parseDollarInput("nope")).toBeNull();
  });
});
