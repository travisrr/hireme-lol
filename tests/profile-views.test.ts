import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  fakeProfileViews,
  isSeedBidder,
  SEED_HANDLES,
  type ProfileViewListing,
} from "../src/lib/profile-views";

const NOW = 1_787_376_070_000;

function bidder(
  overrides: Partial<ProfileViewListing> = {},
): ProfileViewListing {
  return {
    handle: "lindsayplcsw",
    id: "lst_5e6f3ab6-f5a9-42f8-90fe-75cf8bce493e",
    rank: 1,
    currentBidCents: 1000,
    profileCreatedAt: NOW - 36 * 60_000,
    profileClicks: 0,
    ...overrides,
  };
}

describe("fake homepage profile views", () => {
  it("names only the three founding seed handles", () => {
    expect([...SEED_HANDLES]).toEqual(["elon", "palmer", "jensen"]);
    expect(isSeedBidder({ handle: "elon" })).toBe(true);
    expect(isSeedBidder({ handle: "Palmer" })).toBe(true);
    expect(isSeedBidder({ handle: "jensen" })).toBe(true);
    expect(isSeedBidder({ id: "lst_founding_elon" })).toBe(true);
    expect(isSeedBidder({ id: "prf_founding_palmer" })).toBe(true);
    expect(isSeedBidder({ handle: "lindsayplcsw" })).toBe(false);
    expect(isSeedBidder({ handle: "matthewrhodes" })).toBe(false);
  });

  it("omits seed users even when they have a founding badge and old timestamps", () => {
    for (const handle of SEED_HANDLES) {
      expect(
        fakeProfileViews(
          bidder({
            handle,
            id: `lst_founding_${handle}`,
            rank: 3,
            currentBidCents: 600,
            profileCreatedAt: 1_755_808_000_000,
          }),
          NOW,
        ),
      ).toBeNull();
    }
  });

  it("gives live bidders a stable, growing view count and adds real clicks", () => {
    const lindsay = bidder();
    const first = fakeProfileViews(lindsay, NOW);
    const later = fakeProfileViews(lindsay, NOW + 60 * 60_000);
    expect(first).toBeGreaterThan(100);
    expect(first).toBeLessThan(250);
    expect(later).toBeGreaterThan(first!);
    expect(fakeProfileViews(lindsay, NOW)).toBe(first);
    expect(
      fakeProfileViews({ ...lindsay, profileClicks: 4 }, NOW),
    ).toBe(first! + 4);

    const matthew = fakeProfileViews(
      bidder({
        handle: "matthewrhodes",
        id: "lst_dc5eb6b4-e519-49bb-9082-7e73db236186",
        rank: 2,
        currentBidCents: 800,
        profileCreatedAt: NOW - 3 * 60 * 60_000,
        profileClicks: 1,
      }),
      NOW,
    );
    expect(matthew).toBeGreaterThan(100);
    expect(matthew).not.toBe(first);
  });

  it("shows the views int on board rows and keeps seed users off it", () => {
    const row = readFileSync("src/components/ListingRow.tsx", "utf8");
    expect(row).toContain("fakeProfileViews");
    expect(row).toContain("profileViews");
    const clicks = readFileSync("src/components/ClickStat.tsx", "utf8");
    expect(clicks).toContain("ViewsIntIcon");
    expect(clicks).toContain("Profile views");
    expect(clicks).toContain("profileViews");
    expect(clicks).not.toMatch(/cursor/i);
  });
});
