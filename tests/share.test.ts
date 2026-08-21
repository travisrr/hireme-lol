import { describe, expect, it } from "vitest";
import { parseEconomics } from "../src/lib/economics";
import { receiptLine } from "../src/lib/receipts";
import { shareLine } from "../src/lib/share";
import { DEFAULT_ECONOMICS } from "../src/lib/types";

describe("share", () => {
  it("locks the taunt", () => {
    expect(shareLine(37)).toBe(
      "I'm #37 on workwithme.lol. Think I deserve to be lower?",
    );
  });
});

describe("parseEconomics", () => {
  it("reads site_config keys and falls back to launch defaults", () => {
    expect(
      parseEconomics({
        min_entry_cents: "200",
        min_increment_cents: "200",
      }),
    ).toEqual(DEFAULT_ECONOMICS);
    expect(parseEconomics({})).toEqual(DEFAULT_ECONOMICS);
    expect(
      parseEconomics({
        min_entry_cents: "900",
        min_increment_cents: "300",
      }),
    ).toEqual({ minEntryCents: 900, minIncrementCents: 300 });
  });
});

describe("receipts", () => {
  it("writes claim and outbid lines", () => {
    expect(
      receiptLine({
        id: "1",
        type: "bid_confirmed",
        handle: "maya",
        displayName: "Maya",
        amountCents: 200,
        rankAfter: 3,
        createdAt: 1,
      }),
    ).toBe("Claimed / #3 / $2");
    expect(
      receiptLine({
        id: "2",
        type: "outbid",
        handle: "maya",
        displayName: "Maya",
        amountCents: 4200,
        rankAfter: 1,
        createdAt: 1,
      }),
    ).toBe("Outbid on #1 / New bid: $42");
  });
});
