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
      "People looking for someone to work with start at the top.",
      "Your LinkedIn and site take the clicks.",
      "Higher bid = higher rank. That’s the whole product.",
      "Get seen first. Everyone else is below you.",
      "$2 to enter. +$2 to overtake whoever’s there.",
      "They can take it back. You can take it again.",
    ]);
    const page = readFileSync("src/pages/JoinPage.tsx", "utf8");
    expect(page).toContain("join-lock");
    expect(page).toContain("WhyTakeCard");
    expect(page).toContain("SignInCard");
    expect(page).toContain("joinStepFromServer");
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(
      /@media \(min-width: 1024px\) \{[\s\S]*?\.join-lock \{[\s\S]*?1fr 1fr/,
    );
    expect(page).toContain("join-why-title type-claim");
    expect(css).toMatch(/\.join-why-list \{[\s\S]*?gap: 8px;/);
    expect(css).toMatch(/\.join-why-list li::marker \{[\s\S]*?#0a66c2/);
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
