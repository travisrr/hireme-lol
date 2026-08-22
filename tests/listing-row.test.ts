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
      "A professional leaderboard where visibility is earned. Bid on your name, climb the rankings, and get discovered by people looking for someone like you. Your profile sends every click directly to your LinkedIn or website. Get outbid? Take back your spot.",
    );
  });

  it("locks square 12px-radius photos and LinkedIn + site click ints", () => {
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(/--photo:\s*40px/);
    expect(css).toMatch(/\.listing-photo \{[\s\S]*?width: 40px;[\s\S]*?border-radius: 12px;/);
    expect(css).toMatch(/\.photo-tile \{[\s\S]*?border-radius: 12px;/);
    expect(css).toMatch(/\.photo-tile img \{[\s\S]*?border-radius: 0;/);
    expect(css).not.toMatch(/\.photo-tile \{[^}]*border-radius:\s*50%/);
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
    expect(clicks).toContain("ViewsIntIcon");
    expect(clicks).toContain("LinkedInIntIcon");
    expect(clicks).toContain("SiteIntIcon");
    expect(clicks).not.toContain("M3.5 2.5 12 8.2");
    expect(clicks).not.toMatch(/cursor/i);
    expect(css).toMatch(/\.click-int::after \{[\s\S]*?width: 44px;[\s\S]*?height: 44px;/);
    expect(css).toMatch(/--row-min:\s*56px/);
  });

  it("puts LinkedIn and website icon links on rows and profiles", () => {
    const row = readFileSync("src/components/ListingRow.tsx", "utf8");
    expect(row).toMatch(/<div className="listing-who">/);
    expect(row).not.toMatch(/<button[\s\S]*className="listing-who"/);
    expect(row).toContain("ClickStat");
    expect(row).toContain("linkedinUrl={listing.linkedinUrl}");
    expect(row).toContain("websiteUrl={listing.websiteUrl}");
    const clicks = readFileSync("src/components/ClickStat.tsx", "utf8");
    expect(clicks).toContain("LinkedInIntIcon");
    expect(clicks).toContain("SiteIntIcon");
    expect(clicks).toContain("ProfileOutboundLinks");
    expect(clicks).toContain('label="LinkedIn profile"');
    expect(clicks).toContain('label="Website"');
    expect(clicks).not.toMatch(/cursor/i);
    const profile = readFileSync("src/pages/ProfilePage.tsx", "utf8");
    expect(profile).toContain("ProfileOutboundLinks");
    expect(profile).not.toContain("openOutbound");
    expect(profile).not.toMatch(/>\s*LinkedIn\s*</);
    expect(profile).not.toMatch(/>\s*Website\s*</);
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(/\.profile-outbounds \{/);
    expect(css).not.toMatch(
      /@media \(max-width: 429px\) \{[\s\S]*?\.listing-who \.click-ints \{[\s\S]*?display: none/,
    );
    const join = readFileSync("src/pages/JoinPage.tsx", "utf8");
    expect(join).toContain('name="websiteUrl"');
    expect(join).toContain("websiteUrl: next.websiteUrl");
  });

  it("locks 72px two-line mobile rows and 32 hug Outbid", () => {
    expect(ROW_MIN_MOBILE_PX).toBe(72);
    expect(PHOTO_MOBILE_PX).toBe(40);
    expect(RANK_COL_MOBILE_PX).toBe(24);
    expect(OUTBID_MIN_PX).toBe(32);
    const row = readFileSync("src/components/ListingRow.tsx", "utf8");
    expect(row).toContain("listing-name");
    expect(row).toContain("listing-industry");
    expect(row).toContain("listingIndustry");
    expect(row).not.toContain("listing-founding");
    expect(row).not.toContain("FOUNDING");
    expect(row).toContain("listing-copy");
    expect(row).toContain("listingPitch");
    expect(row).toContain("listing-bid");
    expect(row).not.toContain("MovementMark");
    expect(row).not.toContain("listing-headline");
    expect(row).not.toContain("jobHeadline");
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(
      /\.listing-industry \{[\s\S]*?font-size: 12px;[\s\S]*?font-weight: 500;/,
    );
    expect(css).toMatch(
      /\.listing-copy \{[\s\S]*?overflow: hidden;[\s\S]*?text-overflow: ellipsis;/,
    );
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
