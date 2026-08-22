import { readFileSync } from "node:fs";
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
  PULSE_CARD_PAD_X,
  PULSE_ROW_H,
  SEARCH_GAP,
  SEARCH_H,
} from "../src/lib/measure";
import { publicPhotoSrc } from "../src/lib/photo";
import {
  itemsForTab,
  padPulseRows,
  pulseEmptyCopy,
  pulseRowParts,
  PULSE_LIST_LIMIT,
  TRENDING_REFRESH_MS,
  trendingFromListings,
  type TrendingListing,
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
  it("is a Trending-only card and caps the list at 5", () => {
    const card = readFileSync("src/components/PulseCard.tsx", "utf8");
    expect(card).toContain(">Trending<");
    expect(card).not.toContain("Activity");
    expect(card).not.toContain("PULSE_TABS");
    expect(card).toContain("hero-pulse-rank");
    expect(card).toContain("hero-pulse-amount");
    expect(card).toContain("hero-pulse-time");
    expect(PULSE_LIST_LIMIT).toBe(5);
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(/\.hero-pulse \{[\s\S]*?min-height: 0;[\s\S]*?padding: 8px 10px;/);
    expect(css).toMatch(/\.hero-pulse-title \{[\s\S]*?font-size: 13px;[\s\S]*?font-weight: 700;/);
    expect(css).toMatch(/\.hero-pulse-list \{[\s\S]*?margin: 4px 0 0;/);
    expect(css).toMatch(/\.hero-pulse-row \{[\s\S]*?flex: none;[\s\S]*?height: 36px;/);
    expect(css).toMatch(/\.hero-pulse-row \{[\s\S]*?space-between;/);
    expect(css).toMatch(/\.hero-pulse-foot \{[\s\S]*?margin: 4px 0 0;[\s\S]*?line-height: 1;/);
    expect(css).toMatch(/\.hero-pulse-foot a \{[\s\S]*?line-height: 1;/);
    expect(css).toMatch(/\.pulse-photo,[\s\S]*?width: 28px;[\s\S]*?border-radius: 8px;/);
    expect(css).toMatch(
      /\.pulse-photo,\s*\.hero-pulse-row \.photo-tile \{[\s\S]*?border-radius: 8px;[\s\S]*?\}/,
    );
    expect(css).not.toMatch(
      /\.pulse-photo,\s*\.hero-pulse-row \.photo-tile \{[^}]*border-radius:\s*50%/,
    );
    expect(css).toMatch(/\.hero-lock \{[\s\S]*?align-items: start;/);
    expect(css).not.toMatch(/\.hero-pulse \{\s*position: absolute;/);
    expect(card).toContain("hero-pulse-foot");
    expect(card).not.toContain("<p className=\"hero-pulse-foot\"");
    expect(card).toContain("radius={8}");
    expect(card).not.toContain("radius={12}");
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
    expect(card).toContain("hero-pulse-empty");
    expect(card).toContain("pulseEmptyCopy");
  });

  it("keeps Activity seed fill and leaves live Trending unpadded", () => {
    expect(itemsForTab("trending", [], [])).toHaveLength(0);
    expect(pulseEmptyCopy("trending")).toBe("No movement yet.");
    expect(itemsForTab("activity", [], [])).toHaveLength(5);
    expect(padPulseRows([]).filter((row) => row == null)).toHaveLength(0);
  });

  it("maps the live overall board into Trending and does not pad with seed names", () => {
    const now = 1_700_000_000_000;
    const hour = 60 * 60 * 1000;
    const live: TrendingListing[] = [
      {
        id: "lst_lindsay",
        handle: "lindsayplcsw",
        displayName: "Lindsay P. LCSW",
        photoUrl: "https://example.com/lindsay.jpg",
        rank: 1,
        currentBidCents: 1000,
        currentBidAt: now - 2 * hour,
      },
      {
        id: "lst_matthew",
        handle: "matthewrhodes",
        displayName: "Matthew Rhodes",
        photoUrl: "https://example.com/matthew.jpg",
        rank: 2,
        currentBidCents: 800,
        currentBidAt: now - 3 * hour,
      },
    ];
    const rows = trendingFromListings(live, now);
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.name)).toEqual([
      "Lindsay P. LCSW",
      "Matthew Rhodes",
    ]);
    expect(rows.map((row) => row.href)).toEqual([
      "/lindsayplcsw",
      "/matthewrhodes",
    ]);
    expect(rows[0]).toMatchObject({
      rank: 1,
      amount: "$10",
      time: "2h ago",
    });
    expect(pulseRowParts(rows[0])).toEqual({
      name: "Lindsay P. LCSW",
      rank: "#1",
      amount: "$10",
      time: "2h ago",
    });
    const shown = itemsForTab("trending", rows, []);
    expect(shown.map((row) => row.name)).toEqual([
      "Lindsay P. LCSW",
      "Matthew Rhodes",
    ]);
    expect(shown.some((row) => row.name === "Elon Musk")).toBe(false);
    expect(shown.some((row) => row.name === "Maya Chen")).toBe(false);
    const stale = trendingFromListings(
      [
        {
          id: "lst_elon",
          handle: "elon",
          displayName: "Elon Musk",
          photoUrl: null,
          rank: 3,
          currentBidCents: 600,
          currentBidAt: now - 20 * 24 * hour,
        },
      ],
      now,
    );
    expect(stale[0]?.time).toBe("");
    expect(pulseRowParts(stale[0]!)).toMatchObject({
      name: "Elon Musk",
      rank: "#3",
      amount: "$6",
      time: "",
    });
    const home = readFileSync("src/pages/HomePage.tsx", "utf8");
    expect(home).toContain("trendingFromListings");
    expect(home).toContain("TRENDING_REFRESH_MS");
    expect(home).not.toContain("seededTrending");
    expect(TRENDING_REFRESH_MS).toBe(15_000);
    const extra = Array.from({ length: 8 }, (_, index) => ({
      id: `lst_${index}`,
      handle: `h${index}`,
      displayName: `Person ${index}`,
      photoUrl: null,
      rank: index + 1,
      currentBidCents: 200,
      currentBidAt: now,
    }));
    expect(trendingFromListings(extra, now)).toHaveLength(5);
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
    expect(new Set(seededTrending().map((row) => row.href)).size).toBe(5);
    expect(seededTrending().map((row) => row.line)).toEqual([
      "Elon Musk · #1 · $6 · 2h ago",
      "Palmer Luckey · #2 · $4 · 3h ago",
      "Jensen Huang · #3 · $2 · 4h ago",
      "Maya Chen · #4 · $2 · 5h ago",
      "Noah Okonkwo · #5 · $2 · 6h ago",
    ]);
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
    expect(PULSE_ROW_H).toBe(36);
    expect(PULSE_CARD_PAD).toBe(8);
    expect(PULSE_CARD_PAD_X).toBe(10);
  });
});
