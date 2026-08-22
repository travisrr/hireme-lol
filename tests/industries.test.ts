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
  it("locks the eight board tabs", () => {
    expect(BOARD_TABS.map((tab) => tab.label)).toEqual([
      "Overall",
      "Technology",
      "Finance",
      "Healthcare",
      "Real estate",
      "Legal",
      "Marketing",
      "Consulting",
    ]);
    expect(CATEGORY_PATHS).toEqual([
      "/technology",
      "/finance",
      "/healthcare",
      "/real-estate",
      "/legal",
      "/marketing",
      "/consulting",
    ]);
    expect(BOARD_TABS.map((tab) => tab.label)).not.toContain("Founders");
    expect(BOARD_TABS.map((tab) => tab.label)).not.toContain("Developers");
  });

  it("routes category slugs and defaults unknown tabs to Overall", () => {
    expect(parseBoardTab(null)).toBe("overall");
    expect(parseBoardTab("technology")).toBe("technology");
    expect(parseIndustry("finance")).toBe("finance");
    expect(parseIndustry("overall")).toBeNull();
    expect(tabHref("overall")).toBe("/");
    expect(tabHref("technology")).toBe("/technology");
    expect(tabHref("real-estate")).toBe("/real-estate");
    expect(tabFromPath("/technology")).toBe("technology");
    expect(tabFromPath("/legal/")).toBe("legal");
    expect(tabFromPath("/")).toBe("overall");
    expect(tabFromPath("/", "healthcare")).toBe("healthcare");
    expect(tabFromPath("/elon", "technology")).toBe("technology");
    expect(parseBoardTab("founders")).toBe("overall");
  });

  it("keeps category slugs off the handle namespace", () => {
    expect(isValidHandle("technology")).toBe(false);
    expect(isValidHandle("real-estate")).toBe(false);
    expect(isValidHandle("consulting")).toBe(false);
    expect(isValidHandle("privacy")).toBe(false);
    expect(isValidHandle("terms")).toBe(false);
    expect(isValidHandle("how-it-works")).toBe(false);
  });

  it("caps categories per person and locks empty-tab copy", () => {
    expect(MAX_CATEGORIES).toBe(3);
    expect(
      parseCategories(["technology", "finance", "legal", "marketing"]),
    ).toEqual(["technology", "finance", "legal"]);
    expect(emptyIndustryCopy("Healthcare")).toBe(
      "No bids in Healthcare yet. Be first.",
    );
  });
});
