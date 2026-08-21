import { describe, expect, it } from "vitest";
import { signStripePayload } from "../src/lib/stripe-signature";
import { createApp } from "../src/server/app";
import { MemoryStore } from "../src/server/memory-store";

function testApp(store = new MemoryStore(), stripeSecret?: string) {
  const sent: { to: string; subject: string }[] = [];
  const app = createApp({
    store,
    config: {
      origin: "http://localhost:5173",
      siteName: "workwithme.lol",
      adminEmails: ["admin@workwithme.lol"],
      stripeWebhookSecret: stripeSecret,
      emailFrom: "board@workwithme.lol",
    },
    sendEmail: async (input) => {
      sent.push({ to: input.to, subject: input.subject });
    },
  });
  return { app, store, sent };
}

async function json(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

async function magicLogin(
  app: ReturnType<typeof createApp>,
  email: string,
): Promise<string> {
  const request = await app.request("/api/auth/magic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const body = await json(request);
  const previewUrl = String(body.previewUrl);
  const verify = await app.request(previewUrl.replace("http://localhost:5173", ""));
  const cookie = verify.headers.get("set-cookie") ?? "";
  const match = /wmw_session=([^;]+)/.exec(cookie);
  if (!match) throw new Error("missing session cookie");
  return `wmw_session=${match[1]}`;
}

async function createProfile(
  app: ReturnType<typeof createApp>,
  cookie: string,
  handle: string,
) {
  return app.request("/api/me/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      handle,
      displayName: handle.toUpperCase(),
      headline: "Operator",
      company: "Independent",
      pitch: "I bid in tests.",
      websiteUrl: "https://example.com",
    }),
  });
}

async function pay(
  app: ReturnType<typeof createApp>,
  cookie: string,
  amountCents: number,
  eventId: string,
  webhookSecret?: string,
) {
  const bidRes = await app.request("/api/bids", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ amountCents }),
  });
  const bid = await json(bidRes);
  const payload = JSON.stringify({
    id: eventId,
    type: "checkout.session.completed",
    data: {
      object: {
        id: `cs_${eventId}`,
        amount_total: amountCents,
        metadata: { bid_id: bid.bidId },
      },
    },
  });
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (webhookSecret) {
    headers["stripe-signature"] = await signStripePayload(
      webhookSecret,
      payload,
      Math.floor(Date.now() / 1000),
    );
  }
  const webhook = await app.request("/api/stripe/webhook", {
    method: "POST",
    headers,
    body: payload,
  });
  return { bid, webhook, webhookBody: await json(webhook) };
}

describe("live API", () => {
  it("starts with an empty live board", async () => {
    const { app } = testApp();
    const body = await json(await app.request("/api/board"));
    expect(body.listings).toEqual([]);
  });

  it("magic-link auth, profile, and webhook-authoritative bid", async () => {
    const { app } = testApp();
    const cookie = await magicLogin(app, "maya@example.com");
    expect((await createProfile(app, cookie, "maya")).status).toBe(200);
    const paid = await pay(app, cookie, 200, "evt_maya");
    expect(paid.webhookBody.result).toEqual({
      outcome: "confirmed",
      listingId: expect.any(String),
    });
    const board = await json(await app.request("/api/board"));
    const listings = board.listings as Array<{ handle: string; rank: number }>;
    expect(listings).toHaveLength(1);
    expect(listings[0].handle).toBe("maya");
    expect(listings[0].rank).toBe(1);
    const profile = await json(await app.request("/api/profiles/maya"));
    expect((profile.ranked as { rank: number }).rank).toBe(1);
  });

  it("replays the same Stripe event once", async () => {
    const secret = "whsec_test";
    const { app } = testApp(new MemoryStore(), secret);
    const cookie = await magicLogin(app, "maya@example.com");
    await createProfile(app, cookie, "maya");
    const first = await pay(app, cookie, 1500, "evt_same", secret);
    const second = await pay(app, cookie, 1500, "evt_same", secret);
    expect(first.webhookBody.result).toMatchObject({ outcome: "confirmed" });
    expect(second.webhookBody.result).toMatchObject({ outcome: "idempotent" });
  });

  it("exposes live economics from config", async () => {
    const { app } = testApp();
    const body = await json(await app.request("/api/config"));
    expect(body.minEntryCents).toBe(200);
    expect(body.minIncrementCents).toBe(200);
  });

  it("rejects a bid under the configured entry and keeps the board empty", async () => {
    const { app } = testApp();
    const cookie = await magicLogin(app, "low@example.com");
    await createProfile(app, cookie, "lowball");
    const bidRes = await app.request("/api/bids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ amountCents: 199 }),
    });
    expect(bidRes.status).toBe(400);
    const board = await json(await app.request("/api/board"));
    expect(board.listings).toEqual([]);
  });

  it("keeps both listings after an outbid and emails the person who fell", async () => {
    const { app, sent } = testApp();
    const a = await magicLogin(app, "a@example.com");
    const b = await magicLogin(app, "b@example.com");
    await createProfile(app, a, "alpha");
    await createProfile(app, b, "beta");
    await pay(app, a, 200, "evt_a");
    await pay(app, b, 400, "evt_b");
    const board = await json(await app.request("/api/board"));
    const listings = board.listings as Array<{ handle: string; rank: number }>;
    expect(listings.map((row) => row.handle)).toEqual(["beta", "alpha"]);
    expect(listings).toHaveLength(2);
    expect(sent.some((item) => item.to === "a@example.com")).toBe(true);
  });

  it("search matches handle and not everyone", async () => {
    const { app } = testApp();
    const a = await magicLogin(app, "a@example.com");
    await createProfile(app, a, "alpha");
    await pay(app, a, 200, "evt_a");
    const hit = await json(await app.request("/api/board?q=alp"));
    const miss = await json(await app.request("/api/board?q=zzz"));
    expect(hit.listings as unknown[]).toHaveLength(1);
    expect(miss.listings as unknown[]).toHaveLength(0);
  });

  it("admin can hide a listing", async () => {
    const { app } = testApp();
    const admin = await magicLogin(app, "admin@workwithme.lol");
    const user = await magicLogin(app, "maya@example.com");
    await createProfile(app, user, "maya");
    const paid = await pay(app, user, 200, "evt_hide");
    const listingId = (paid.webhookBody.result as { listingId: string }).listingId;
    const hide = await app.request(`/api/admin/listings/${listingId}/hidden`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: admin,
      },
      body: JSON.stringify({ hidden: true }),
    });
    expect(hide.status).toBe(200);
    const board = await json(await app.request("/api/board"));
    expect(board.listings).toEqual([]);
  });

  it("rejects a forged webhook when a secret is configured", async () => {
    const { app } = testApp(new MemoryStore(), "whsec_real");
    const webhook = await app.request("/api/stripe/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "t=1,v1=nope",
      },
      body: JSON.stringify({ id: "evt_x", type: "checkout.session.completed" }),
    });
    expect(webhook.status).toBe(400);
  });
});
