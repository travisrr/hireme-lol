import { describe, expect, it } from "vitest";
import { compareListings, effectiveBidCents } from "../src/lib/ranking";
import {
  isShareCrawler,
  listingShareUrl,
  parseSharePlatform,
  SHARE_MAX_POINTS,
  shareCreditCents,
  shareJuice,
  shareMaxCreditCents,
} from "../src/lib/share-rank";
import { DEFAULT_ECONOMICS } from "../src/lib/types";

describe("share juice is fair across bidders", () => {
  it("caps credit just under one overtake so paid steps still win", () => {
    expect(shareMaxCreditCents(200)).toBe(199);
    expect(shareCreditCents(0)).toBe(0);
    expect(shareCreditCents(1)).toBe(25);
    expect(shareCreditCents(8)).toBe(199);
    expect(shareCreditCents(80)).toBe(199);
    expect(shareJuice(8).countedVisits).toBe(SHARE_MAX_POINTS);
    expect(shareJuice(12).uniqueVisits).toBe(12);
    expect(shareJuice(12).creditCents).toBe(199);
  });

  it("cannot leapfrog a full paid overtake", () => {
    const juicer = {
      id: "juice",
      currentBidCents: 400,
      currentBidAt: 50,
      profileCreatedAt: 1,
      shareCreditCents: shareCreditCents(8),
    };
    const paid = {
      id: "paid",
      currentBidCents: 600,
      currentBidAt: 90,
      profileCreatedAt: 9,
      shareCreditCents: 0,
    };
    expect(effectiveBidCents(juicer)).toBeLessThan(effectiveBidCents(paid));
    expect(compareListings(juicer, paid)).toBeGreaterThan(0);
  });

  it("lets juice pass a same-bid listing that arrived first", () => {
    const earlier = {
      id: "first",
      currentBidCents: 400,
      currentBidAt: 10,
      profileCreatedAt: 1,
      shareCreditCents: 0,
    };
    const later = {
      id: "later",
      currentBidCents: 400,
      currentBidAt: 90,
      profileCreatedAt: 9,
      shareCreditCents: shareCreditCents(3),
    };
    expect(compareListings(later, earlier)).toBeLessThan(0);
  });

  it("uses the same window, platforms, and crawler skip for everyone", () => {
    expect(parseSharePlatform("linkedin")).toBe("linkedin");
    expect(parseSharePlatform("twitter")).toBe("x");
    expect(parseSharePlatform("nope")).toBeNull();
    expect(isShareCrawler("Mozilla/5.0 LinkedInBot/1.0")).toBe(true);
    expect(isShareCrawler("facebookexternalhit/1.1")).toBe(true);
    expect(isShareCrawler("")).toBe(true);
    expect(
      isShareCrawler(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      ),
    ).toBe(false);
    expect(listingShareUrl("maya", "linkedin")).toContain("/maya?from=linkedin");
    expect(DEFAULT_ECONOMICS.minIncrementCents).toBe(200);
  });
});
