import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  HOW_IT_WORKS_BEATS,
  HOW_IT_WORKS_CONTACT,
  HOW_IT_WORKS_DOCUMENT_TITLE,
  HOW_IT_WORKS_FAQ,
  HOW_IT_WORKS_LEAD,
  HOW_IT_WORKS_LOOP,
  HOW_IT_WORKS_MONEY,
  HOW_IT_WORKS_NAV,
  HOW_IT_WORKS_PATH,
  HOW_IT_WORKS_SECTIONS,
  HOW_IT_WORKS_TAB_LINE,
  HOW_IT_WORKS_TITLE,
} from "../src/lib/how-it-works";
import { CONTACT_EMAIL, CONTACT_LINE } from "../src/lib/legal";
import { HOW_IT_WORKS_STEPS, SITE } from "../src/lib/site";

const COPY_FILES = [
  "src/lib/how-it-works.ts",
  "src/pages/HowItWorksPage.tsx",
  "src/components/SiteHeader.tsx",
  "src/components/SiteFooter.tsx",
];

describe("how it works", () => {
  it("keeps the four LinkedIn beats and names the loop", () => {
    expect(HOW_IT_WORKS_STEPS).toEqual([
      "Sign in with LinkedIn.",
      "We fill name, photo, and headline.",
      "You set a bid.",
      "You share your rank.",
    ]);
    expect(HOW_IT_WORKS_BEATS.map((beat) => beat.title)).toEqual([
      ...HOW_IT_WORKS_STEPS,
    ]);
    expect(HOW_IT_WORKS_LOOP).toBe(
      "Join → Bid → Rank → Share → Get Outbid → Bid Again.",
    );
    expect(HOW_IT_WORKS_LEAD).toBe(SITE.deck);
    expect(HOW_IT_WORKS_TITLE).toBe("How it works");
    expect(HOW_IT_WORKS_NAV).toBe("How it works");
    expect(HOW_IT_WORKS_PATH).toBe("/how-it-works");
    expect(HOW_IT_WORKS_DOCUMENT_TITLE).toBe(
      "How it works — workwithme.lol",
    );
  });

  it("states $2 / +$2, outbid-not-delete, and purchased attention", () => {
    expect(HOW_IT_WORKS_MONEY).toEqual([
      { value: "$2", label: "to enter" },
      { value: "+$2", label: "to overtake" },
    ]);
    const blob = JSON.stringify({
      beats: HOW_IT_WORKS_BEATS,
      sections: HOW_IT_WORKS_SECTIONS,
      faq: HOW_IT_WORKS_FAQ,
    });
    expect(blob).toContain("$2 to enter");
    expect(blob).toContain("+$2 to overtake");
    expect(blob).toContain("Next rank = qualifying bid + $2");
    expect(blob).toContain("You are not deleted");
    expect(blob).toContain("Money buys placement, not quality");
    expect(blob).toContain("purchased attention");
    expect(blob).toContain("Sign in with LinkedIn");
    expect(blob).not.toContain("$5 to enter");
    expect(blob).not.toContain("+$1 to overtake");
  });

  it("lists the eight board tabs and click ints", () => {
    expect(HOW_IT_WORKS_TAB_LINE).toBe(
      "Overall, Technology, Finance, Healthcare, Real estate, Legal, Marketing, Consulting",
    );
    const board = HOW_IT_WORKS_SECTIONS.find((block) => block.heading === "The board");
    expect(board?.paragraphs[0]).toContain(HOW_IT_WORKS_TAB_LINE);
    expect(board?.paragraphs[1]).toContain("LinkedIn icon");
    expect(board?.paragraphs[1]).toContain("site icon");
  });

  it("puts hello@ on the page and never hireme.lol", () => {
    expect(HOW_IT_WORKS_CONTACT.paragraphs).toEqual([CONTACT_LINE]);
    expect(HOW_IT_WORKS_CONTACT.paragraphs[0]).toContain(CONTACT_EMAIL);
    for (const path of COPY_FILES) {
      const text = readFileSync(path, "utf8");
      expect(text).not.toMatch(/hireme\.lol/);
      expect(text).not.toMatch(/travis@/i);
    }
  });

  it("routes /how-it-works and links it from header and footer", () => {
    const app = readFileSync("src/App.tsx", "utf8");
    expect(app).toContain('path="/how-it-works"');
    expect(app).toContain("HowItWorksPage");
    const header = readFileSync("src/components/SiteHeader.tsx", "utf8");
    expect(header).toContain("HOW_IT_WORKS_PATH");
    expect(header).toContain("HOW_IT_WORKS_NAV");
    const footer = readFileSync("src/components/SiteFooter.tsx", "utf8");
    expect(footer).toContain('to="/how-it-works"');
    expect(footer).toContain("How it works");
    const page = readFileSync("src/pages/HowItWorksPage.tsx", "utf8");
    expect(page).toContain('data-lock="how-it-works"');
    expect(page).toContain("HOW_IT_WORKS_BEATS");
    expect(page).toContain("HOW_IT_WORKS_FAQ");
    expect(page).toContain('to="/join"');
  });
});
