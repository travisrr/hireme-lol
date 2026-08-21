import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "../src/lib/time";

const NOW = Date.parse("2026-08-21T22:00:00.000Z");

describe("formatRelativeTime", () => {
  it("uses short units for recent times", () => {
    expect(formatRelativeTime(NOW - 20_000, NOW)).toBe("just now");
    expect(formatRelativeTime(NOW - 5 * 60_000, NOW)).toBe("5m ago");
    expect(formatRelativeTime(NOW - 3 * 60 * 60_000, NOW)).toBe("3h ago");
    expect(formatRelativeTime(NOW - 2 * 24 * 60 * 60_000, NOW)).toBe("2d ago");
  });

  it("hides year-old stamps instead of 365d ago", () => {
    const yearAgo = NOW - 365 * 24 * 60 * 60_000;
    expect(formatRelativeTime(yearAgo, NOW)).toBe("");
    expect(formatRelativeTime(yearAgo, NOW)).not.toMatch(/d ago/);
  });
});
