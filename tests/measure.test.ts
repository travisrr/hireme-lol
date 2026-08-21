import { describe, expect, it } from "vitest";
import { PAGE_COLUMN } from "../src/lib/measure";

describe("desktop measure", () => {
  it("uses the 1024px column, not 1152 or 896", () => {
    expect(PAGE_COLUMN).toBe("max-w-5xl");
    expect(PAGE_COLUMN).not.toBe("max-w-6xl");
    expect(PAGE_COLUMN).not.toBe("max-w-4xl");
  });
});
