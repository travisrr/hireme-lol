import { describe, expect, it } from "vitest";
import {
  formatStripeSignatureHeader,
  signStripePayload,
  verifyStripeSignature,
} from "../src/lib/stripe-signature";

describe("stripe signatures", () => {
  it("accepts a matching t=,v1= header", async () => {
    const secret = "whsec_test";
    const payload = '{"id":"evt_1"}';
    const timestamp = "1710000000";
    const signature = await signStripePayload(secret, timestamp, payload);
    await expect(
      verifyStripeSignature({
        secret,
        header: formatStripeSignatureHeader(timestamp, signature),
        payload,
      }),
    ).resolves.toBe(true);
  });

  it("rejects a forged signature", async () => {
    await expect(
      verifyStripeSignature({
        secret: "whsec_test",
        header: "t=1710000000,v1=nope",
        payload: '{"id":"evt_1"}',
      }),
    ).resolves.toBe(false);
  });
});
