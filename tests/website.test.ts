import { describe, expect, it } from "vitest";
import { normalizeWebsiteUrl } from "../src/lib/website";

describe("website urls", () => {
  it("normalizes http(s) sites and rejects junk", () => {
    expect(normalizeWebsiteUrl("")).toBeNull();
    expect(normalizeWebsiteUrl("   ")).toBeNull();
    expect(normalizeWebsiteUrl("example.com")).toBe("https://example.com");
    expect(normalizeWebsiteUrl("https://example.com/about")).toBe(
      "https://example.com/about",
    );
    expect(normalizeWebsiteUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeWebsiteUrl("ftp://example.com")).toBeNull();
    expect(normalizeWebsiteUrl("not a url")).toBeNull();
  });
});
