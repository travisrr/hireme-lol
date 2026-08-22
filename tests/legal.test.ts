import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CONTACT_EMAIL,
  CONTACT_LINE,
  PRIVACY_DOC,
  TERMS_DOC,
} from "../src/lib/legal";
import { HEADER_CTA_H, HEADER_H, HEADER_LEGAL_GAP } from "../src/lib/measure";

describe("privacy and terms", () => {
  it("locks Design's Privacy copy with Travis's hello@ address", () => {
    expect(PRIVACY_DOC.title).toBe("Privacy");
    expect(PRIVACY_DOC.updated).toBe("Updated August 21, 2026");
    expect(PRIVACY_DOC.blocks.map((block) => block.heading)).toEqual([
      undefined,
      "What we collect",
      "What is public",
      "What we don’t do",
      "Contact",
    ]);
    expect(PRIVACY_DOC.blocks[0]?.paragraphs).toEqual([
      "workwithme.lol is a public professional leaderboard. Bid for rank. Your listing is meant to be seen.",
    ]);
    expect(CONTACT_EMAIL).toBe("hello@workwithme.lol");
    expect(CONTACT_LINE).toBe(
      "Questions about the board: hello@workwithme.lol.",
    );
    const blob = JSON.stringify(PRIVACY_DOC);
    expect(blob).toContain(CONTACT_EMAIL);
    expect(blob).not.toMatch(/travis@/i);
    expect(blob).not.toContain("reach the operator");
  });

  it("locks Design's Terms copy", () => {
    expect(TERMS_DOC.title).toBe("Terms");
    expect(TERMS_DOC.updated).toBe("Updated August 21, 2026");
    expect(TERMS_DOC.blocks.map((block) => block.heading)).toEqual([
      undefined,
      "Bidding",
      "Your listing",
      "The board",
      "Contact",
    ]);
    expect(TERMS_DOC.blocks[1]?.paragraphs[0]).toContain("$2 to enter");
    expect(TERMS_DOC.blocks[4]?.paragraphs).toEqual([CONTACT_LINE]);
    expect(JSON.stringify(TERMS_DOC)).toContain(CONTACT_EMAIL);
    expect(JSON.stringify(TERMS_DOC)).not.toMatch(/travis@/i);
    expect(JSON.stringify(TERMS_DOC)).not.toContain("reach the operator");
  });

  it("puts hello@ in a site footer with Privacy · Terms", () => {
    const footer = readFileSync("src/components/SiteFooter.tsx", "utf8");
    expect(footer).toContain("CONTACT_EMAIL");
    expect(footer).toContain("mailto:${CONTACT_EMAIL}");
    expect(footer).toContain("{SITE.footer}");
    expect(footer).toContain('to="/how-it-works"');
    expect(footer).toContain('to="/privacy"');
    expect(footer).toContain('to="/terms"');
    expect(footer).toContain(" · ");
    expect(footer).not.toMatch(/hireme\.lol/);
    expect(footer).not.toMatch(/travis@/i);
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(/\.site-footer \{[\s\S]*?border-top:/);
  });

  it("locks header How it works Privacy Terms left of the 36 hug CTA", () => {
    expect(HEADER_H).toBe(48);
    expect(HEADER_CTA_H).toBe(36);
    expect(HEADER_LEGAL_GAP).toBe(16);
    const header = readFileSync("src/components/SiteHeader.tsx", "utf8");
    const howAt = header.indexOf("HOW_IT_WORKS_PATH");
    const privacyAt = header.indexOf('to="/privacy"');
    const termsAt = header.indexOf('to="/terms"');
    expect(header).toContain("HOW_IT_WORKS_NAV");
    expect(howAt).toBeGreaterThan(-1);
    expect(privacyAt).toBeGreaterThan(howAt);
    expect(termsAt).toBeGreaterThan(privacyAt);
    expect(header).toContain("btn-header");
    expect(header).not.toMatch(/hamburger/i);
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(/\.btn-header \{[\s\S]*?height: 36px;/);
    expect(css).toMatch(/\.header-legal \{[\s\S]*?font-size: 13px;/);
    expect(css).toMatch(/@media \(max-width: 767px\) \{[\s\S]*?\.header-legal \{[\s\S]*?display: none;/);
  });

  it("keeps NEW out of the board rank gutter", () => {
    const row = readFileSync("src/components/ListingRow.tsx", "utf8");
    expect(row).not.toContain("MovementMark");
    expect(row).not.toMatch(/\bNEW\b/);
    expect(row).not.toMatch(/\bnew\b/);
  });
});
