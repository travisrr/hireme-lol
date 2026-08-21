import { describe, expect, it } from "vitest";
import {
  BOARD_TABS,
  emptyIndustryCopy,
  parseBoardTab,
  parseIndustry,
} from "../src/lib/industries";

describe("industry tabs", () => {
  it("keeps Overall first and never drops an empty industry", () => {
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
  });

  it("defaults unknown tabs to Overall", () => {
    expect(parseBoardTab(null)).toBe("overall");
    expect(parseBoardTab("healthcare")).toBe("healthcare");
    expect(parseIndustry("healthcare")).toBe("healthcare");
    expect(parseIndustry("overall")).toBeNull();
  });

  it("locks the empty-tab sentence", () => {
    expect(emptyIndustryCopy("Healthcare")).toBe(
      "No bids in Healthcare yet. Be first.",
    );
  });
});
