import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CONTACT_LINE, PRIVACY_DOC, TERMS_DOC } from "../src/lib/legal";

describe("privacy and terms", () => {
  it("locks Design's Privacy copy with no invented email", () => {
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
    expect(CONTACT_LINE).toBe(
      "Questions about the board: reach the operator of workwithme.lol.",
    );
    const blob = JSON.stringify(PRIVACY_DOC);
    expect(blob).not.toMatch(/travis@/i);
    expect(blob).not.toContain("@workwithme.lol");
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
    expect(JSON.stringify(TERMS_DOC)).not.toMatch(/travis@/i);
  });

  it("keeps NEW out of the board rank gutter", () => {
    const row = readFileSync("src/components/ListingRow.tsx", "utf8");
    expect(row).not.toContain("MovementMark");
    expect(row).not.toMatch(/\bNEW\b/);
    expect(row).not.toMatch(/\bnew\b/);
  });
});
