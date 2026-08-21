import { describe, expect, it } from "vitest";
import { initialsFromName, isClickTarget, totalClicks } from "../src/lib/clicks";
import { handleFromName } from "../src/lib/handles";

describe("click stats", () => {
  it("starts at zero and only sums real counters", () => {
    expect(totalClicks({})).toBe(0);
    expect(
      totalClicks({ profileClicks: 1, linkedinClicks: 2, websiteClicks: 3 }),
    ).toBe(6);
  });

  it("accepts only real click-through targets", () => {
    expect(isClickTarget("profile")).toBe(true);
    expect(isClickTarget("linkedin")).toBe(true);
    expect(isClickTarget("site")).toBe(true);
    expect(isClickTarget("fake")).toBe(false);
  });

  it("builds initials without inventing a face", () => {
    expect(initialsFromName("Elon Musk")).toBe("EM");
    expect(initialsFromName("jensen")).toBe("JE");
  });
});

describe("join identity handles", () => {
  it("derives a valid handle from a name", () => {
    expect(handleFromName("Maya Chen")).toBe("mayachen");
  });
});
