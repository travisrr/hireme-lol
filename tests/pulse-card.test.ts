import { describe, expect, it } from "vitest";
import { FOUNDING_HEADSHOT_KEYS } from "../src/lib/media";
import {
  HEADER_H,
  HERO_CLAIM_GAP,
  HERO_CTA_DESKTOP,
  HERO_CTA_MOBILE,
  HERO_GAP_UNDER_SEARCH,
  HERO_GRID_GAP,
  PULSE_CARD_PAD,
  PULSE_ROW_H,
  SEARCH_GAP,
  SEARCH_H,
} from "../src/lib/measure";
import { publicPhotoSrc } from "../src/lib/photo";
import {
  itemsForTab,
  padPulseRows,
  PULSE_LIST_LIMIT,
  PULSE_TABS,
} from "../src/lib/pulse";
import {
  boardActivityOrSeed,
  seededBoardActivity,
} from "../src/lib/activity-seed";
import { seededActivity, seededTrending } from "../src/lib/pulse-seed";
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

  it("always fills both tabs to 5 named rows", () => {
    expect(itemsForTab("trending", [], []).every((row) => row.line.length > 0)).toBe(
      true,
    );
    expect(itemsForTab("trending", [], [])).toHaveLength(5);
    expect(itemsForTab("activity", [], [])).toHaveLength(5);
    expect(padPulseRows([]).filter((row) => row == null)).toHaveLength(0);
  });

  it("locks the five named Activity rows with photos and no 365d stamp", () => {
    const lines = seededActivity().map((row) => row.line);
    expect(lines).toEqual([
      "Elon Musk claimed #1 · $6 · 2h ago",
      "Palmer Luckey claimed #2 · $4 · 3h ago",
      "Jensen Huang claimed #3 · $2 · 4h ago",
      "Palmer Luckey joined the board · 3h ago",
      "Elon Musk joined the board · 2h ago",
    ]);
    expect(lines.join(" ")).not.toMatch(/365d|Claimed \/ #/);
    expect(seededActivity().map((row) => row.photoUrl)).toEqual([
      publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.elon),
      publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.palmer),
      publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.jensen),
      publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.palmer),
      publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.elon),
    ]);
    expect(seededTrending()).toHaveLength(5);
    expect(seededBoardActivity()).toHaveLength(5);
    expect(boardActivityOrSeed([]).map((row) => row.displayName)).toEqual([
      "Elon Musk",
      "Palmer Luckey",
      "Jensen Huang",
      "Palmer Luckey",
      "Elon Musk",
    ]);
  });

  it("locks header/hero density to 8 / 12 / 16 and 40 desktop taps", () => {
    expect(HEADER_H).toBe(48);
    expect(SEARCH_H).toBe(40);
    expect(SEARCH_GAP).toBe(8);
    expect(HERO_GAP_UNDER_SEARCH).toBe(12);
    expect(HERO_GRID_GAP).toBe(16);
    expect(HERO_CLAIM_GAP).toBe(12);
    expect(HERO_CTA_DESKTOP).toBe(40);
    expect(HERO_CTA_MOBILE).toBe(44);
    expect(PULSE_ROW_H).toBe(40);
    expect(PULSE_CARD_PAD).toBe(12);
  });
});
