export type PaddleEnvironment = "sandbox" | "production";

export type PaddleWebhookAction = "complete" | "refund" | "ignore";

export type PaddleEventData = {
  id?: string;
  status?: string;
  action?: string;
  transaction_id?: string;
  custom_data?: { bid_id?: string } | null;
  details?: {
    totals?: {
      total?: string;
      grand_total?: string;
    };
  };
};

export type PaddleLikeEvent = {
  event_id?: string;
  event_type?: string;
  data?: PaddleEventData;
};

const KNOWN_EVENT_TYPES = [
  "transaction.completed",
  "adjustment.created",
  "adjustment.updated",
] as const;

type KnownPaddleEventType = (typeof KNOWN_EVENT_TYPES)[number];

export function parsePaddleEnvironment(
  value: string | undefined,
): PaddleEnvironment {
  if (value === "production" || value === "live") return "production";
  return "sandbox";
}

export function paddleApiBase(environment: PaddleEnvironment): string {
  return environment === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

function isKnownEventType(value: string): value is KnownPaddleEventType {
  return (KNOWN_EVENT_TYPES as readonly string[]).includes(value);
}

function isApprovedRefund(data: PaddleEventData | undefined): boolean {
  if (!data) return false;
  if (data.action !== "refund" && data.action !== "chargeback") return false;
  return data.status === "approved";
}

export function classifyPaddleEvent(
  eventType: string,
  data?: PaddleEventData,
): PaddleWebhookAction {
  if (!isKnownEventType(eventType)) return "ignore";
  switch (eventType) {
    case "transaction.completed":
      return "complete";
    case "adjustment.created":
    case "adjustment.updated":
      return isApprovedRefund(data) ? "refund" : "ignore";
    default: {
      const _never: never = eventType;
      return _never;
    }
  }
}

export function paddleEventId(event: PaddleLikeEvent): string | null {
  return event.event_id ? event.event_id : null;
}

export function paddleBidId(event: PaddleLikeEvent): string | undefined {
  const fromCustom = event.data?.custom_data?.bid_id;
  return fromCustom ? fromCustom : undefined;
}

export function paddleTransactionId(event: PaddleLikeEvent): string | undefined {
  if (event.event_type === "transaction.completed") {
    return event.data?.id;
  }
  return event.data?.transaction_id ?? event.data?.id;
}

export function paddleAmountCents(event: PaddleLikeEvent): number | undefined {
  const raw =
    event.data?.details?.totals?.grand_total ?? event.data?.details?.totals?.total;
  if (!raw) return undefined;
  const amount = Number(raw);
  return Number.isInteger(amount) ? amount : undefined;
}

export async function createPaddleTransaction(input: {
  apiKey: string;
  environment: PaddleEnvironment;
  origin: string;
  amountCents: number;
  handle: string;
  bidId: string;
}): Promise<{ id: string; checkoutUrl: string | null }> {
  const response = await fetch(`${paddleApiBase(input.environment)}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
      "Paddle-Version": "1",
    },
    body: JSON.stringify({
      items: [
        {
          quantity: 1,
          price: {
            name: `workwithme.lol bid @${input.handle}`,
            description: "One-time board bid",
            unit_price: {
              amount: String(input.amountCents),
              currency_code: "USD",
            },
            product: {
              name: "workwithme.lol bid",
              description: "One-time bid for rank on workwithme.lol",
              tax_category: "standard",
            },
          },
        },
      ],
      currency_code: "USD",
      collection_mode: "automatic",
      custom_data: { bid_id: input.bidId },
      checkout: {
        settings: {
          success_url: `${input.origin}/?bid=success`,
        },
      },
    }),
  });
  const body = (await response.json()) as {
    data?: { id?: string; checkout?: { url?: string | null } };
  };
  const id = body.data?.id;
  if (!id) {
    throw new Error("paddle_checkout_failed");
  }
  return {
    id,
    checkoutUrl: body.data?.checkout?.url ?? null,
  };
}

export async function refundPaddleTransaction(input: {
  apiKey: string;
  environment: PaddleEnvironment;
  transactionId: string;
}): Promise<void> {
  await fetch(`${paddleApiBase(input.environment)}/adjustments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
      "Paddle-Version": "1",
    },
    body: JSON.stringify({
      action: "refund",
      type: "full",
      transaction_id: input.transactionId,
      reason: "error",
    }),
  });
}
