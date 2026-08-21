import { describe, expect, it } from "vitest";
import {
  classifyStripeEvent,
  extractCompletedCheckout,
  extractRefundedCharge,
  stripeCheckoutForm,
} from "../src/lib/stripe";

describe("stripe event classify", () => {
  it("commits rank only on checkout.session.completed", () => {
    expect(classifyStripeEvent("checkout.session.completed")).toBe("complete");
  });

  it("reverts rank on charge.refunded", () => {
    expect(classifyStripeEvent("charge.refunded")).toBe("refund");
  });

  it("ignores every other type including subscription events", () => {
    expect(classifyStripeEvent("customer.subscription.created")).toBe("ignore");
    expect(classifyStripeEvent("invoice.paid")).toBe("ignore");
    expect(classifyStripeEvent("payment_intent.succeeded")).toBe("ignore");
  });
});

describe("stripe event extract", () => {
  it("reads bid metadata from a completed Checkout Session", () => {
    expect(
      extractCompletedCheckout({
        id: "cs_123",
        amount_total: 200,
        payment_intent: "pi_123",
        metadata: { bid_id: "bid_1" },
      }),
    ).toEqual({
      checkoutSessionId: "cs_123",
      paymentIntentId: "pi_123",
      bidId: "bid_1",
      amountCents: 200,
    });
  });

  it("creates one-time Checkout Sessions without listing payment methods", () => {
    const body = stripeCheckoutForm({
      bidId: "bid_1",
      amountCents: 200,
      origin: "https://workwithme.lol",
    });
    expect(body.get("mode")).toBe("payment");
    expect(body.get("payment_method_types[0]")).toBeNull();
    expect(body.has("payment_method_types")).toBe(false);
    expect(body.get("line_items[0][price_data][unit_amount]")).toBe("200");
  });

  it("reads a refunded charge by payment intent", () => {
    expect(
      extractRefundedCharge({
        id: "ch_1",
        payment_intent: "pi_123",
        amount: 200,
      }),
    ).toEqual({
      paymentIntentId: "pi_123",
      amountCents: 200,
    });
  });
});
