import { describe, expect, it } from "vitest";
import { isValidHandle } from "../src/lib/handles";
import {
  BOARD_TABS,
  CATEGORY_PATHS,
  MAX_CATEGORIES,
  emptyIndustryCopy,
  parseBoardTab,
  parseCategories,
  parseIndustry,
  tabFromPath,
  tabHref,
} from "../src/lib/industries";

describe("category tabs", () => {
  it("keeps Overall first and ships every Travis category", () => {
    expect(BOARD_TABS.map((tab) => tab.label)).toEqual([
      "Overall",
      "Founders",
      "Developers",
      "Designers",
      "Sales",
      "Marketing",
      "Recruiters",
      "Finance",
      "AI",
      "Hospitality",
      "Creators",
      "Operators",
      "Consultants",
    ]);
    expect(CATEGORY_PATHS).toEqual([
      "/founders",
      "/developers",
      "/designers",
      "/sales",
      "/marketing",
      "/recruiters",
      "/finance",
      "/ai",
      "/hospitality",
      "/creators",
      "/operators",
      "/consultants",
    ]);
  });

  it("routes category slugs and defaults unknown tabs to Overall", () => {
    expect(parseBoardTab(null)).toBe("overall");
    expect(parseBoardTab("founders")).toBe("founders");
    expect(parseIndustry("ai")).toBe("ai");
    expect(parseIndustry("overall")).toBeNull();
    expect(tabHref("overall")).toBe("/");
    expect(tabHref("founders")).toBe("/founders");
    expect(tabHref("ai")).toBe("/ai");
    expect(tabFromPath("/founders")).toBe("founders");
    expect(tabFromPath("/ai/")).toBe("ai");
    expect(tabFromPath("/")).toBe("overall");
    expect(tabFromPath("/", "hospitality")).toBe("hospitality");
    expect(tabFromPath("/elon", "founders")).toBe("founders");
  });

  it("keeps category slugs off the handle namespace", () => {
    expect(isValidHandle("founders")).toBe(false);
    expect(isValidHandle("hospitality")).toBe(false);
    expect(isValidHandle("consultants")).toBe(false);
    expect(isValidHandle("how-it-works")).toBe(false);
  });

  it("caps categories per person and locks empty-tab copy", () => {
    expect(MAX_CATEGORIES).toBe(3);
    expect(parseCategories(["founders", "ai", "operators", "sales"])).toEqual([
      "founders",
      "ai",
      "operators",
    ]);
    expect(emptyIndustryCopy("Hospitality")).toBe(
      "No bids in Hospitality yet. Be first.",
    );
  });
});
