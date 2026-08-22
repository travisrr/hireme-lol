import { describe, expect, it } from "vitest";
import {
  listingCopy,
  listingIndustry,
  listingPitch,
} from "../src/lib/listing-copy";

describe("board row copy", () => {
  it("shows industry and elevator pitch, skipping founding placeholders", () => {
    expect(
      listingCopy({
        industry: "real-estate",
        pitch: "",
        headline: "",
      }),
    ).toBe("Real estate");
    expect(
      listingCopy({
        industry: "healthcare",
        pitch: "Healthcare Executive",
      }),
    ).toBe("Healthcare · Healthcare Executive");
    expect(
      listingCopy({
        industry: null,
        categories: [],
        pitch: "Founding bid.",
        headline: "Founding member",
      }),
    ).toBe("");
    expect(listingPitch("Founding bid.")).toBe("");
    expect(listingPitch("", "Founding member")).toBe("");
    expect(listingIndustry("real-estate")).toBe("Real estate");
    expect(listingIndustry(null, ["healthcare"])).toBe("Healthcare");
  });
});
