import { describe, expect, it } from "vitest";
import {
  OUTBID_MIN_PX,
  PHOTO_PX,
  ROW_MIN_PX,
  TOP_TEN_CUTOFF,
} from "../src/components/ListingRow";
import { SITE } from "../src/lib/site";

describe("board rows", () => {
  it("locks mobile row geometry", () => {
    expect(ROW_MIN_PX).toBe(72);
    expect(PHOTO_PX).toBe(44);
    expect(OUTBID_MIN_PX).toBe(32);
  });

  it("locks one compact claim why paragraph", () => {
    expect(SITE.claimWhy).toBe(
      "The professional leaderboard. Bid for your name, get seen, get outbid, do it again. People looking for someone to work with start at #1. Your LinkedIn and site take the clicks. Higher bid = higher rank. That’s it.",
    );
  });

  it("highlights ranks 1–10 only", () => {
    expect(TOP_TEN_CUTOFF).toBe(10);
    expect(1 <= TOP_TEN_CUTOFF).toBe(true);
    expect(10 <= TOP_TEN_CUTOFF).toBe(true);
    expect(11 <= TOP_TEN_CUTOFF).toBe(false);
  });
});
