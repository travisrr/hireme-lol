import { describe, expect, it } from "vitest";
import {
  signPaddlePayload,
  verifyPaddleSignature,
} from "../src/lib/paddle-signature";

describe("paddle signatures", () => {
  it("accepts a matching payload and rejects a tampered one", async () => {
    const secret = "pdl_ntfset_test";
    const payload = `{"event_id":"evt_1"}`;
    const now = 1_700_000_000;
    const header = await signPaddlePayload(secret, payload, now);
    expect(
      await verifyPaddleSignature({
        payload,
        header,
        secret,
        nowMs: now * 1000,
      }),
    ).toBe(true);
    expect(
      await verifyPaddleSignature({
        payload: `{"event_id":"evt_2"}`,
        header,
        secret,
        nowMs: now * 1000,
      }),
    ).toBe(false);
  });
});
