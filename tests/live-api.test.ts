import { describe, expect, it } from "vitest";
import { signPaddlePayload } from "../src/lib/paddle-signature";
import { createApp } from "../src/server/app";
import { MemoryStore } from "../src/server/memory-store";

function testApp(store = new MemoryStore(), paddleSecret?: string) {
  const sent: { to: string; subject: string }[] = [];
  const app = createApp({
    store,
    config: {
      origin: "http://localhost:5173",
      siteName: "workwithme.lol",
      adminEmails: ["admin@workwithme.lol"],
      paddleWebhookSecret: paddleSecret,
      paddleEnvironment: "sandbox",
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
    event_id: eventId,
    event_type: "transaction.completed",
    data: {
      id: `txn_${eventId}`,
      custom_data: { bid_id: bid.bidId },
      details: { totals: { grand_total: String(amountCents) } },
    },
  });
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (webhookSecret) {
    headers["paddle-signature"] = await signPaddlePayload(
      webhookSecret,
      payload,
      Math.floor(Date.now() / 1000),
    );
  }
  const webhook = await app.request("/api/paddle/webhook", {
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

  it("creating a checkout does not move the board", async () => {
    const { app } = testApp();
    const cookie = await magicLogin(app, "maya@example.com");
    await createProfile(app, cookie, "maya");
    const bidRes = await app.request("/api/bids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ amountCents: 200 }),
    });
    const bid = await json(bidRes);
    expect(bid.bidId).toEqual(expect.any(String));
    expect(bid.devConfirm).toBe(true);
    const board = await json(await app.request("/api/board"));
    expect(board.listings).toEqual([]);
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

  it("replays the same Paddle event once", async () => {
    const secret = "pdl_ntfset_test";
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
    expect(body.paddleEnabled).toBe(false);
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
    const { app } = testApp(new MemoryStore(), "pdl_ntfset_real");
    const webhook = await app.request("/api/paddle/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "paddle-signature": "ts=1;h1=nope",
      },
      body: JSON.stringify({
        event_id: "evt_x",
        event_type: "transaction.completed",
      }),
    });
    expect(webhook.status).toBe(400);
  });

  it("does not apply rank in production when the webhook secret is missing", async () => {
    const store = new MemoryStore();
    const app = createApp({
      store,
      config: {
        origin: "https://workwithme.lol",
        siteName: "workwithme.lol",
        adminEmails: [],
        paddleEnvironment: "sandbox",
        emailFrom: "board@workwithme.lol",
      },
    });
    const webhook = await app.request("/api/paddle/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: "evt_prod",
        event_type: "transaction.completed",
        data: { custom_data: { bid_id: "bid_missing" } },
      }),
    });
    expect(webhook.status).toBe(500);
    const board = await json(await app.request("/api/board"));
    expect(board.listings).toEqual([]);
  });

  it("starts click stats at 0 and increments only on a real click-through", async () => {
    const { app } = testApp();
    const cookie = await magicLogin(app, "maya@example.com");
    await createProfile(app, cookie, "maya");
    const paid = await pay(app, cookie, 200, "evt_click");
    const listingId = (paid.webhookBody.result as { listingId: string }).listingId;
    const before = await json(await app.request("/api/board"));
    const first = (before.listings as Array<{
      profileClicks: number;
      linkedinClicks: number;
      websiteClicks: number;
    }>)[0];
    expect(first.profileClicks).toBe(0);
    expect(first.linkedinClicks).toBe(0);
    expect(first.websiteClicks).toBe(0);
    const clicked = await json(
      await app.request(`/api/listings/${listingId}/clicks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "profile" }),
      }),
    );
    expect(clicked.clicks).toBe(1);
    expect(clicked.profileClicks).toBe(1);
    const forged = await app.request(`/api/listings/${listingId}/clicks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: "impressions" }),
    });
    expect(forged.status).toBe(400);
    const after = await json(await app.request("/api/board"));
    expect(
      (after.listings as Array<{ profileClicks: number }>)[0].profileClicks,
    ).toBe(1);
  });

  it("reverts rank on an approved Paddle refund adjustment", async () => {
    const { app } = testApp();
    const cookie = await magicLogin(app, "maya@example.com");
    await createProfile(app, cookie, "maya");
    const paid = await pay(app, cookie, 200, "evt_pay");
    const refundPayload = JSON.stringify({
      event_id: "evt_refund",
      event_type: "adjustment.updated",
      data: {
        id: "adj_1",
        action: "refund",
        status: "approved",
        transaction_id: `txn_evt_pay`,
        custom_data: { bid_id: paid.bid.bidId },
      },
    });
    const refund = await app.request("/api/paddle/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: refundPayload,
    });
    expect((await json(refund)).result).toMatchObject({ outcome: "reverted" });
    const board = await json(await app.request("/api/board"));
    expect(board.listings).toEqual([]);
  });
});
