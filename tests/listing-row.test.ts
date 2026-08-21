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

  it("locks one tight claim why-line", () => {
    expect(SITE.claimWhy).toBe(
      "Higher bid = higher rank. Get seen. Get outbid. That’s it.",
    );
  });

  it("highlights ranks 1–10 only", () => {
    expect(TOP_TEN_CUTOFF).toBe(10);
    expect(1 <= TOP_TEN_CUTOFF).toBe(true);
    expect(10 <= TOP_TEN_CUTOFF).toBe(true);
    expect(11 <= TOP_TEN_CUTOFF).toBe(false);
  });
});
