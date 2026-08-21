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

  it("fills name, photo, and headline after login", () => {
    expect(HOW_IT_WORKS_STEPS).toEqual([
      "Sign in with LinkedIn.",
      "We fill name, photo, and headline.",
      "You set a bid.",
      "You share your rank.",
    ]);
  });
});
