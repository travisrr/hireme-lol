import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HOW_IT_WORKS_STEPS, SITE } from "../src/lib/site";

describe("join is LinkedIn sign-in", () => {
  it("uses the locked LinkedIn copy and does not ask for a paste URL", () => {
    expect(SITE.joinSignIn).toBe(
      "Sign in with LinkedIn. We’ll use your name, photo, and headline.",
    );
    expect(SITE.linkedinCta).toBe("Sign in with LinkedIn");
    expect(SITE.joinSignIn.toLowerCase()).not.toContain("paste");
    expect(SITE.joinLead.toLowerCase()).not.toContain("url");
  });

  it("locks Why take #1 beside Sign in with LinkedIn", () => {
    expect(SITE.joinWhyTitle).toBe("Why take #1");
    expect(SITE.joinWhyBullets).toEqual([
      "First name they see. That’s the status.",
      "They start at #1. They never make it to #2.",
      "Every click off the board is yours.",
      "#1 is public. Everyone can see you beat the field.",
      "You own the top of your industry, out loud.",
      "A #1 rank is a flex. It travels when you post it.",
      "They remember who wanted the top enough to take it.",
      "Stay #1 and you stay the one they find.",
    ]);
    expect(SITE.joinWhyBullets).toHaveLength(8);
    const page = readFileSync("src/pages/JoinPage.tsx", "utf8");
    expect(page).toContain("join-lock");
    expect(page).toContain("WhyTakeCard");
    expect(page).toContain("SignInCard");
    expect(page).toContain("joinStepFromServer");
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(
      /@media \(min-width: 1024px\) \{[\s\S]*?\.join-lock \{[\s\S]*?1fr 1fr/,
    );
    expect(page).toContain("join-why-title");
    expect(page).not.toContain("join-why-title type-claim");
    expect(page).toContain("Elevator pitch");
    expect(page).toContain("Pick an industry so you show on that tab.");
    expect(css).toMatch(/\.join-why-title \{[\s\S]*?font-size: 26px;[\s\S]*?font-weight: 800;/);
    expect(css).toMatch(/\.join-why-list \{[\s\S]*?gap: 12px;/);
    expect(css).toMatch(
      /\.join-why-list li \{[\s\S]*?padding-left: 26px;[\s\S]*?font-size: 20px;[\s\S]*?font-weight: 700;[\s\S]*?line-height: 1\.35;/,
    );
    expect(css).toMatch(/\.join-why-list li::before \{[\s\S]*?width: 10px;[\s\S]*?height: 10px;[\s\S]*?#0a66c2/);
  });

  it("fills name, photo, and headline after login", () => {
    expect(HOW_IT_WORKS_STEPS).toEqual([
      "Sign in with LinkedIn.",
      "We fill name, photo, and headline.",
      "You set a bid.",
      "You share your rank.",
    ]);
  });
});
