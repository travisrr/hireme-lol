import { describe, expect, it } from "vitest";

/**
 * Pure stand-in for the D1 payment-event PRIMARY KEY gate.
 * The Worker will insert evt_... first; a second delivery is a no-op.
 */
function applyStripeEvent(
  seen: Set<string>,
  eventId: string,
  apply: () => void,
): "applied" | "duplicate" {
  if (seen.has(eventId)) return "duplicate";
  seen.add(eventId);
  apply();
  return "applied";
}

describe("webhook idempotency contract", () => {
  it("applies a new event once and ignores the replay", () => {
    const seen = new Set<string>();
    let boardWrites = 0;
    const first = applyStripeEvent(seen, "evt_1", () => {
      boardWrites += 1;
    });
    const second = applyStripeEvent(seen, "evt_1", () => {
      boardWrites += 1;
    });
    expect(first).toBe("applied");
    expect(second).toBe("duplicate");
    expect(boardWrites).toBe(1);
  });

  it("still applies a different event", () => {
    const seen = new Set<string>();
    let boardWrites = 0;
    applyStripeEvent(seen, "evt_1", () => {
      boardWrites += 1;
    });
    applyStripeEvent(seen, "evt_2", () => {
      boardWrites += 1;
    });
    expect(boardWrites).toBe(2);
  });
});
