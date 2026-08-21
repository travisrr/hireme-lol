import { describe, expect, it } from "vitest";
import {
  signStripePayload,
  verifyStripeSignature,
} from "../src/lib/stripe-signature";

describe("stripe signatures", () => {
  it("accepts a matching payload and rejects a tampered one", async () => {
    const secret = "whsec_abc";
    const payload = `{"id":"evt_1"}`;
    const now = 1_700_000_000;
    const header = await signStripePayload(secret, payload, now);
    expect(
      await verifyStripeSignature({
        payload,
        header,
        secret,
        nowMs: now * 1000,
      }),
    ).toBe(true);
    expect(
      await verifyStripeSignature({
        payload: `{"id":"evt_2"}`,
        header,
        secret,
        nowMs: now * 1000,
      }),
    ).toBe(false);
  });
});
