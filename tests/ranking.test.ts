import { describe, expect, it } from "vitest";
import {
  clampOutbidDollars,
  formatUsdFromCents,
  parseBidAmountCents,
  parseDollarInput,
} from "../src/lib/money";
import {
  claimPriceForRank,
  compareListings,
  evaluateBidApply,
  minBidToEnter,
  minBidToOvertake,
  minOutbidCents,
  movementFor,
  rankListings,
} from "../src/lib/ranking";
import {
  DEFAULT_ECONOMICS,
  LAUNCH_ECONOMICS,
  type BidEconomics,
  type ListingForRank,
} from "../src/lib/types";

const launch = DEFAULT_ECONOMICS;

function listing(
  partial: Partial<ListingForRank> & Pick<ListingForRank, "id">,
): ListingForRank {
  return {
    currentBidCents: 200,
    currentBidAt: 1_000,
    profileCreatedAt: 1_000,
    ...partial,
  };
}

describe("launch economics", () => {
  it("defaults to $2 entry / +$2 overtake and reads from the passed config", () => {
    expect(LAUNCH_ECONOMICS).toEqual({
      minEntryCents: 200,
      minIncrementCents: 200,
    });
    expect(DEFAULT_ECONOMICS).toEqual(LAUNCH_ECONOMICS);
    expect(DEFAULT_ECONOMICS.minEntryCents).toBe(200);
    expect(DEFAULT_ECONOMICS.minIncrementCents).toBe(200);
    expect(minBidToEnter(launch)).toBe(200);
    expect(minBidToOvertake(200, launch)).toBe(400);
    expect(minBidToOvertake(240000, launch)).toBe(240200);
    expect(minOutbidCents(null, launch)).toBe(200);
    expect(minOutbidCents(undefined, launch)).toBe(200);
    expect(minOutbidCents(800, launch)).toBe(1000);
    expect(minOutbidCents(1000, launch)).toBe(1200);
    const custom: BidEconomics = { minEntryCents: 700, minIncrementCents: 50 };
    expect(minBidToEnter(custom)).toBe(700);
    expect(minBidToOvertake(10000, custom)).toBe(10050);
  });
});

describe("rankListings", () => {
  it("orders by highest bid first", () => {
    const ranked = rankListings([
      listing({ id: "a", currentBidCents: 200 }),
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
  it("rejects anything under the configured entry", () => {
    expect(
      evaluateBidApply({
        amountCents: 199,
        listingCurrentBidCents: null,
        economics: launch,
      }),
    ).toEqual({
      ok: false,
      reason: "below_entry",
    });
  });

  it("lets an entry-floor bid enter even if #1 is huge", () => {
    expect(
      evaluateBidApply({
        amountCents: 200,
        listingCurrentBidCents: null,
        economics: launch,
      }),
    ).toEqual({
      ok: true,
      kind: "enter",
    });
  });

  it("requires the configured increment to raise your own listing", () => {
    expect(
      evaluateBidApply({
        amountCents: 10100,
        listingCurrentBidCents: 10000,
        economics: launch,
      }),
    ).toEqual({ ok: false, reason: "not_an_overtake" });
    expect(
      evaluateBidApply({
        amountCents: 10200,
        listingCurrentBidCents: 10000,
        economics: launch,
      }),
    ).toEqual({ ok: true, kind: "raise" });
    expect(
      evaluateBidApply({
        amountCents: 10100,
        listingCurrentBidCents: 10000,
        economics: { minEntryCents: 200, minIncrementCents: 100 },
      }),
    ).toEqual({ ok: true, kind: "raise" });
  });
});

describe("claimPriceForRank", () => {
  it("is entry floor on an empty board", () => {
    expect(claimPriceForRank([], 1, launch)).toBe(200);
  });

  it("is occupant plus configured increment for an occupied rank", () => {
    const ranked = rankListings([
      listing({ id: "top", currentBidCents: 240000 }),
      listing({ id: "two", currentBidCents: 10000 }),
    ]);
    expect(claimPriceForRank(ranked, 1, launch)).toBe(240200);
    expect(claimPriceForRank(ranked, 2, launch)).toBe(10200);
    expect(claimPriceForRank(ranked, 3, launch)).toBe(200);
  });

  it("prices founding Elon $6 as $8 to claim #1 and $2 to enter last", () => {
    const ranked = rankListings([
      listing({ id: "elon", currentBidCents: 600 }),
      listing({ id: "palmer", currentBidCents: 400 }),
      listing({ id: "jensen", currentBidCents: 200 }),
    ]);
    expect(claimPriceForRank(ranked, 1, launch)).toBe(800);
    expect(minBidToEnter(launch)).toBe(200);
    const withJoin = rankListings([
      ...ranked,
      listing({ id: "new", currentBidCents: 200, currentBidAt: 9_000 }),
    ]);
    expect(withJoin.map((row) => row.id)).toEqual([
      "elon",
      "palmer",
      "jensen",
      "new",
    ]);
    expect(withJoin[3].rank).toBe(4);
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
    expect(formatUsdFromCents(200)).toBe("$2");
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

  it("treats a join of 2 / $2 as 200 cents, not 2 cents", () => {
    expect(parseDollarInput("2")).toBe(200);
    expect(parseDollarInput("$2")).toBe(200);
    expect(parseBidAmountCents(2)).toBe(200);
    expect(parseBidAmountCents("2")).toBe(200);
    expect(parseBidAmountCents("$2")).toBe(200);
    expect(parseBidAmountCents(200)).toBe(200);
    expect(parseBidAmountCents("200")).toBe(200);
    expect(parseBidAmountCents(8)).toBe(800);
  });

  it("snaps typed Outbid dollars up to the live #1 + $2 min", () => {
    expect(clampOutbidDollars("6", 1000)).toBe("10");
    expect(clampOutbidDollars("$6", 1200)).toBe("12");
    expect(clampOutbidDollars("12", 1200)).toBe("12");
    expect(clampOutbidDollars("20", 1200)).toBe("20");
    expect(clampOutbidDollars("", 1200)).toBe("");
  });
});
