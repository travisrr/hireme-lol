import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { clampOutbidDollars } from "../src/lib/money";
import { minOutbidCents } from "../src/lib/ranking";
import { DEFAULT_ECONOMICS } from "../src/lib/types";

describe("Outbid min lock", () => {
  it("defaults to #1 + $2 and never below $2 on an empty board", () => {
    expect(minOutbidCents(null, DEFAULT_ECONOMICS)).toBe(200);
    expect(minOutbidCents(800, DEFAULT_ECONOMICS)).toBe(1000);
    expect(minOutbidCents(1000, DEFAULT_ECONOMICS)).toBe(1200);
  });

  it("blocks typing $6 when the live min is $10 or $12", () => {
    expect(clampOutbidDollars("6", 1000)).toBe("10");
    expect(clampOutbidDollars("6", 1200)).toBe("12");
    expect(clampOutbidDollars("11", 1200)).toBe("12");
  });

  it("locks the join field to a number input at the live min", () => {
    const join = readFileSync("src/pages/JoinPage.tsx", "utf8");
    expect(join).toContain("minOutbidCents");
    expect(join).toContain("BidAmountField");
    expect(join).toContain('type="number"');
    expect(join).toContain("clampOutbidDollars");
    expect(join).not.toContain('placeholder="2"');
    const row = readFileSync("src/components/ListingRow.tsx", "utf8");
    expect(row).not.toContain("listing-headline");
    expect(row).not.toContain("jobHeadline");
  });
});
