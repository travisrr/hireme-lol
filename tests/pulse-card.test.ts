import { describe, expect, it } from "vitest";
import {
  itemsForTab,
  PULSE_LIST_LIMIT,
  PULSE_TABS,
} from "../src/lib/pulse";
import type { ReceiptItem } from "../src/components/ReceiptCard";

function item(id: string): ReceiptItem {
  return { id, line: id, at: 1 };
}

describe("hero pulse card", () => {
  it("defaults to Trending | Activity and caps the list at 5", () => {
    expect(PULSE_TABS).toEqual(["trending", "activity"]);
    expect(PULSE_LIST_LIMIT).toBe(5);
    const many = Array.from({ length: 8 }, (_, index) => item(`n${index}`));
    expect(itemsForTab("trending", many, []).map((row) => row.id)).toEqual([
      "n0",
      "n1",
      "n2",
      "n3",
      "n4",
    ]);
    expect(itemsForTab("activity", [], many).map((row) => row.id)).toEqual([
      "n0",
      "n1",
      "n2",
      "n3",
      "n4",
    ]);
  });
});
