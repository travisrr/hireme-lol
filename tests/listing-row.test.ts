import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  OUTBID_MIN_PX,
  PHOTO_MOBILE_PX,
  PHOTO_PX,
  PHOTO_RADIUS,
  RANK_COL_MOBILE_PX,
  RANK_COL_PX,
  ROW_MIN_MOBILE_PX,
  ROW_MIN_PX,
  TOP_TEN_CUTOFF,
} from "../src/components/ListingRow";
import { SITE } from "../src/lib/site";

describe("board rows", () => {
  it("locks one-line row geometry with no NEW badge", () => {
    expect(ROW_MIN_PX).toBe(56);
    expect(RANK_COL_PX).toBe(28);
    expect(PHOTO_PX).toBe(40);
    expect(PHOTO_RADIUS).toBe(12);
    expect(OUTBID_MIN_PX).toBe(32);
  });

  it("locks one 15px claim why paragraph", () => {
    expect(SITE.claimWhy).toBe(
      "The professional leaderboard. Bid for your name, get seen, get outbid, do it again. People looking for someone to work with start at #1. Your LinkedIn and site take the clicks. Higher bid = higher rank. That’s it.",
    );
  });

  it("locks square 12px-radius photos and LinkedIn + site click ints", () => {
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(/--photo:\s*40px/);
    expect(css).toMatch(/\.listing-photo \{[\s\S]*?width: 40px;[\s\S]*?border-radius: 12px;/);
    expect(css).toMatch(/\.photo-tile \{[\s\S]*?border-radius: 12px;/);
    expect(css).toMatch(/\.photo-tile img \{[\s\S]*?border-radius: 0;/);
    expect(css).not.toMatch(/\.photo-tile \{[\s\S]*?border-radius:\s*50%/);
    expect(css).not.toMatch(/\.photo-tile[^{]*\{[^}]*border-radius:\s*50%/);
    const tile = readFileSync("src/components/PhotoTile.tsx", "utf8");
    expect(tile).not.toContain("size-11");
    expect(tile).not.toContain("rounded-full");
    expect(tile).toContain('borderRadius: `${radius}px`');
    const pulse = readFileSync("src/components/PulseCard.tsx", "utf8");
    expect(pulse).toContain('className="pulse-photo"');
    expect(pulse).not.toContain("size-10");
    expect(pulse).not.toContain("size-8");
    const clicks = readFileSync("src/components/ClickStat.tsx", "utf8");
    expect(clicks).toContain("LinkedInIntIcon");
    expect(clicks).toContain("SiteIntIcon");
    expect(clicks).not.toContain("M3.5 2.5 12 8.2");
    expect(clicks).not.toMatch(/cursor/i);
  });

  it("locks 72px two-line mobile rows and 32 hug Outbid", () => {
    expect(ROW_MIN_MOBILE_PX).toBe(72);
    expect(PHOTO_MOBILE_PX).toBe(40);
    expect(RANK_COL_MOBILE_PX).toBe(24);
    expect(OUTBID_MIN_PX).toBe(32);
    const row = readFileSync("src/components/ListingRow.tsx", "utf8");
    expect(row).toContain("listing-name");
    expect(row).toContain("listing-founding");
    expect(row).toContain("listing-bid");
    expect(row).not.toContain("MovementMark");
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(/@media \(max-width: 767px\) \{[\s\S]*?\.listing-who \{[\s\S]*?flex-direction: column;/);
    expect(css).toMatch(/@media \(max-width: 767px\) \{[\s\S]*?\.listing-bid \{[\s\S]*?flex-direction: column;/);
  });

  it("highlights ranks 1–10 only", () => {
    expect(TOP_TEN_CUTOFF).toBe(10);
    expect(1 <= TOP_TEN_CUTOFF).toBe(true);
    expect(10 <= TOP_TEN_CUTOFF).toBe(true);
    expect(11 <= TOP_TEN_CUTOFF).toBe(false);
  });
});
