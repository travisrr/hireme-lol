export type StripeEventAction = "complete" | "refund" | "ignore";

export type StripeLikeEvent = {
  id?: string;
  type?: string;
  data?: { object?: Record<string, unknown> };
};

export type StripeCheckoutSession = {
  id: string;
  url: string | null;
  payment_intent?: string | null;
};

type StripeErrorBody = {
  error?: { message?: string };
};

export function classifyStripeEvent(type: string): StripeEventAction {
  switch (type) {
    case "checkout.session.completed":
      return "complete";
    case "charge.refunded":
      return "refund";
    default:
      return "ignore";
  }
}

export function stripeCheckoutForm(opts: {
  bidId: string;
  amountCents: number;
  origin: string;
}): URLSearchParams {
  // Omit payment_method_types so Dashboard Link / dynamic methods work.
  return new URLSearchParams({
    mode: "payment",
    success_url: `${opts.origin}/join?paid=1&bid=${opts.bidId}`,
    cancel_url: `${opts.origin}/join?canceled=1`,
    "metadata[bid_id]": opts.bidId,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(opts.amountCents),
    "line_items[0][price_data][product_data][name]": "workwithme.lol rank",
  });
}

export async function createStripeCheckoutSession(opts: {
  secretKey: string;
  bidId: string;
  amountCents: number;
  origin: string;
}): Promise<StripeCheckoutSession> {
  const body = stripeCheckoutForm(opts);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await response.json()) as StripeCheckoutSession & StripeErrorBody;
  if (!response.ok || !json.id) {
    throw new Error(json.error?.message ?? "Stripe checkout session failed");
  }
  return json;
}

export async function createStripeRefund(opts: {
  secretKey: string;
  paymentIntentId: string;
}): Promise<void> {
  const response = await fetch("https://api.stripe.com/v1/refunds", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ payment_intent: opts.paymentIntentId }),
  });
  if (!response.ok) {
    const json = (await response.json()) as StripeErrorBody;
    throw new Error(json.error?.message ?? "Stripe refund failed");
  }
}

export function extractCompletedCheckout(object: Record<string, unknown>): {
  checkoutSessionId: string;
  paymentIntentId: string | undefined;
  bidId: string | undefined;
  amountCents: number | undefined;
} {
  const metadata = (object.metadata ?? {}) as Record<string, unknown>;
  const paymentIntent = object.payment_intent;
  return {
    checkoutSessionId: String(object.id ?? ""),
    paymentIntentId: typeof paymentIntent === "string" ? paymentIntent : undefined,
    bidId: typeof metadata.bid_id === "string" ? metadata.bid_id : undefined,
    amountCents: typeof object.amount_total === "number" ? object.amount_total : undefined,
  };
}

export function extractRefundedCharge(object: Record<string, unknown>): {
  paymentIntentId: string | undefined;
  amountCents: number | undefined;
} {
  const paymentIntent = object.payment_intent;
  return {
    paymentIntentId: typeof paymentIntent === "string" ? paymentIntent : undefined,
    amountCents: typeof object.amount === "number" ? object.amount : undefined,
  };
}
