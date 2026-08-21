import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { randomToken, sha256Hex } from "../lib/crypto";
import {
  isValidEmail,
  isValidHandle,
  normalizeEmail,
  normalizeHandle,
} from "../lib/handles";
import { minBidToEnter } from "../lib/ranking";
import { SITE } from "../lib/site";
import { verifyStripeSignature } from "../lib/stripe-signature";
import { GLOBAL_BOARD_ID, LAUNCH_ECONOMICS, PUBLIC_ORIGIN } from "../lib/types";
import type { Store } from "./store";

export const SESSION_COOKIE = "wmw_session";

export type AppConfig = {
  origin: string;
  siteName: string;
  adminEmails: string[];
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  githubClientId?: string;
  githubClientSecret?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  emailFrom: string;
  resendApiKey?: string;
  turnstileSecret?: string;
};

export type EmailSender = (input: {
  to: string;
  subject: string;
  text: string;
}) => Promise<void>;

export type AppDeps = {
  store: Store;
  config: AppConfig;
  now?: () => number;
  sendEmail?: EmailSender;
};

type Variables = {
  deps: AppDeps;
};

function clock(deps: AppDeps): number {
  return deps.now ? deps.now() : Date.now();
}

export function createApp(deps: AppDeps) {
  const app = new Hono<{ Variables: Variables }>();

  app.use("*", async (c, next) => {
    c.set("deps", deps);
    await next();
  });

  app.use("/api/*", async (c, next) => {
    const middleware = cors({
      origin: [
        deps.config.origin,
        PUBLIC_ORIGIN,
        "https://www.workwithme.lol",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ],
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "Stripe-Signature"],
      credentials: true,
    });
    return middleware(c, next);
  });

  app.get("/api/health", (c) => {
    return c.json({
      ok: true,
      site: deps.config.siteName,
      origin: deps.config.origin,
      boardMode: "global_only",
      boardId: GLOBAL_BOARD_ID,
      live: true,
    });
  });

  app.get("/api/config", (c) => {
    return c.json({
      minEntryCents: LAUNCH_ECONOMICS.minEntryCents,
      minIncrementCents: LAUNCH_ECONOMICS.minIncrementCents,
      publicOrigin: deps.config.origin,
      boardId: GLOBAL_BOARD_ID,
      stripeEnabled: Boolean(deps.config.stripeSecretKey),
      oauth: {
        github: Boolean(deps.config.githubClientId),
        google: Boolean(deps.config.googleClientId),
      },
    });
  });

  app.get("/api/board", async (c) => {
    const q = c.req.query("q") ?? "";
    const listings = await deps.store.getBoard(q);
    const activity = await deps.store.getActivity(20);
    return c.json({
      boardId: GLOBAL_BOARD_ID,
      listings,
      activity,
    });
  });

  app.get("/api/profiles/:handle", async (c) => {
    const found = await deps.store.getProfileByHandle(
      normalizeHandle(c.req.param("handle")),
    );
    if (!found) return c.json({ error: "not_found" }, 404);
    return c.json(found);
  });

  app.post("/api/auth/magic", async (c) => {
    const body = await readJson(c);
    const email = normalizeEmail(String(body.email ?? ""));
    if (!isValidEmail(email)) return c.json({ error: "invalid_email" }, 400);
    if (
      !(await verifyTurnstile(
        deps.config.turnstileSecret,
        String(body.turnstileToken ?? ""),
      ))
    ) {
      return c.json({ error: "turnstile" }, 400);
    }
    const token = randomToken();
    const tokenHash = await sha256Hex(token);
    const now = clock(deps);
    await deps.store.createMagicLink(
      email,
      tokenHash,
      now + 15 * 60 * 1000,
      now,
    );
    const verifyUrl = `${deps.config.origin}/api/auth/callback?token=${token}`;
    await send(
      deps,
      email,
      `Sign in to ${SITE.name}`,
      `Open this link to get on the board:\n${verifyUrl}\n\nIt expires in 15 minutes.`,
    );
    return c.json({
      ok: true,
      previewUrl: deps.config.resendApiKey ? undefined : verifyUrl,
    });
  });

  app.get("/api/auth/callback", async (c) => {
    const token = c.req.query("token") ?? "";
    if (!token) return c.json({ error: "missing_token" }, 400);
    const now = clock(deps);
    const email = await deps.store.consumeMagicLink(await sha256Hex(token), now);
    if (!email) return c.json({ error: "invalid_token" }, 400);
    await establishSession(c, deps, email, now);
    return c.redirect(`${deps.config.origin}/?signedin=1`);
  });

  app.get("/api/auth/github", (c) => {
    if (!deps.config.githubClientId) {
      return c.json({ error: "oauth_not_configured", provider: "github" }, 501);
    }
    const state = randomToken(16);
    setCookie(c, "wmw_oauth", `github:${state}`, cookieOpts(deps.config.origin));
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", deps.config.githubClientId);
    url.searchParams.set("redirect_uri", `${deps.config.origin}/api/auth/github/callback`);
    url.searchParams.set("scope", "user:email");
    url.searchParams.set("state", state);
    return c.redirect(url.toString());
  });

  app.get("/api/auth/github/callback", async (c) => {
    const email = await githubEmail(c, deps);
    if (!email) return c.json({ error: "oauth_failed", provider: "github" }, 400);
    await establishSession(c, deps, email, clock(deps));
    return c.redirect(`${deps.config.origin}/?signedin=1`);
  });

  app.get("/api/auth/google", (c) => {
    if (!deps.config.googleClientId) {
      return c.json({ error: "oauth_not_configured", provider: "google" }, 501);
    }
    const state = randomToken(16);
    setCookie(c, "wmw_oauth", `google:${state}`, cookieOpts(deps.config.origin));
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", deps.config.googleClientId);
    url.searchParams.set("redirect_uri", `${deps.config.origin}/api/auth/google/callback`);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email");
    url.searchParams.set("state", state);
    return c.redirect(url.toString());
  });

  app.get("/api/auth/google/callback", async (c) => {
    const email = await googleEmail(c, deps);
    if (!email) return c.json({ error: "oauth_failed", provider: "google" }, 400);
    await establishSession(c, deps, email, clock(deps));
    return c.redirect(`${deps.config.origin}/?signedin=1`);
  });

  app.post("/api/auth/logout", async (c) => {
    const sid = getCookie(c, SESSION_COOKIE);
    if (sid) await deps.store.deleteSession(sid);
    deleteCookie(c, SESSION_COOKIE, { path: "/" });
    return c.json({ ok: true });
  });

  app.get("/api/me", async (c) => {
    const session = await readSession(c, deps);
    if (!session) return c.json({ user: null, profile: null, isAdmin: false });
    return c.json(session);
  });

  app.post("/api/me/profile", async (c) => {
    const session = await readSession(c, deps);
    if (!session) return c.json({ error: "unauthorized" }, 401);
    const body = await readJson(c);
    const input = profileFromBody(body);
    if (!input) return c.json({ error: "invalid_profile" }, 400);
    try {
      const profile = session.profile
        ? await deps.store.updateProfile(session.user.id, input, clock(deps))
        : await deps.store.createProfile(session.user.id, input, clock(deps));
      return c.json({ profile });
    } catch (error) {
      const message = error instanceof Error ? error.message : "error";
      return c.json({ error: message }, 400);
    }
  });

  app.post("/api/bids", async (c) => {
    const session = await readSession(c, deps);
    if (!session?.profile) return c.json({ error: "profile_required" }, 401);
    const body = await readJson(c);
    const amountCents = Number(body.amountCents);
    if (!Number.isInteger(amountCents) || amountCents < minBidToEnter()) {
      return c.json({ error: "below_entry" }, 400);
    }
    const now = clock(deps);
    const bid = await deps.store.createPendingBid(
      {
        profileId: session.profile.id,
        amountCents,
        checkoutSessionId: null,
      },
      now,
    );
    let checkoutUrl: string | null = null;
    if (deps.config.stripeSecretKey) {
      const checkout = await createStripeCheckout({
        secret: deps.config.stripeSecretKey,
        origin: deps.config.origin,
        amountCents,
        handle: session.profile.handle,
        bidId: bid.id,
      });
      await deps.store.attachCheckoutSession(bid.id, checkout.id);
      checkoutUrl = checkout.url;
    }
    return c.json({
      bidId: bid.id,
      checkoutUrl,
      devConfirm: !deps.config.stripeSecretKey,
    });
  });

  app.post("/api/stripe/webhook", async (c) => {
    const payload = await c.req.text();
    const signature = c.req.header("stripe-signature") ?? "";
    if (deps.config.stripeWebhookSecret) {
      const ok = await verifyStripeSignature({
        payload,
        header: signature,
        secret: deps.config.stripeWebhookSecret,
      });
      if (!ok) return c.json({ error: "bad_signature" }, 400);
    } else if (!isLocalOrigin(deps.config.origin)) {
      return c.json({ error: "webhook_secret_required" }, 500);
    }
    let event: StripeLikeEvent;
    try {
      event = JSON.parse(payload) as StripeLikeEvent;
    } catch {
      return c.json({ error: "invalid_json" }, 400);
    }
    if (
      event.type !== "checkout.session.completed" &&
      event.type !== "charge.refunded"
    ) {
      return c.json({ ok: true, ignored: event.type });
    }
    const sessionObj = event.data?.object;
    const result = await deps.store.applyStripePayment({
      eventId: event.id,
      eventType: event.type,
      bidId: optionalString(sessionObj?.metadata?.bid_id),
      checkoutSessionId: optionalString(sessionObj?.id),
      paymentIntentId: optionalString(sessionObj?.payment_intent),
      amountCents:
        typeof sessionObj?.amount_total === "number"
          ? sessionObj.amount_total
          : undefined,
      paidAt: clock(deps),
    });
    if (result.outcome === "refund") {
      await maybeRefund(deps, optionalString(sessionObj?.payment_intent));
    }
    await flushNotifications(deps);
    return c.json({ ok: true, result });
  });

  app.get("/api/unsubscribe", async (c) => {
    const email = normalizeEmail(c.req.query("email") ?? "");
    const token = c.req.query("token") ?? "";
    if (!isValidEmail(email) || !token) {
      return c.json({ error: "invalid" }, 400);
    }
    await deps.store.unsubscribe(email, token, clock(deps));
    return c.json({ ok: true });
  });

  app.get("/api/admin/overview", async (c) => {
    const session = await readSession(c, deps);
    if (!session?.isAdmin) return c.json({ error: "forbidden" }, 403);
    return c.json(await deps.store.adminOverview());
  });

  app.post("/api/admin/listings/:id/hidden", async (c) => {
    const session = await readSession(c, deps);
    if (!session?.isAdmin) return c.json({ error: "forbidden" }, 403);
    const body = await readJson(c);
    await deps.store.hideListing(
      c.req.param("id"),
      Boolean(body.hidden),
      clock(deps),
    );
    return c.json({ ok: true });
  });

  app.post("/api/admin/profiles/:id/founding", async (c) => {
    const session = await readSession(c, deps);
    if (!session?.isAdmin) return c.json({ error: "forbidden" }, 403);
    const body = await readJson(c);
    await deps.store.setFounding(c.req.param("id"), Boolean(body.value));
    return c.json({ ok: true });
  });

  return app;
}

type StripeLikeEvent = {
  id: string;
  type: string;
  data?: {
    object?: {
      id?: string;
      amount_total?: number;
      payment_intent?: string;
      metadata?: { bid_id?: string };
    };
  };
};

function optionalString(value: string | undefined): string | undefined {
  return value ? value : undefined;
}

function isLocalOrigin(origin: string): boolean {
  return (
    origin.startsWith("http://localhost") ||
    origin.startsWith("http://127.0.0.1")
  );
}

async function readJson(c: {
  req: { json: () => Promise<unknown> };
}): Promise<Record<string, unknown>> {
  try {
    const value = await c.req.json();
    if (value && typeof value === "object") {
      return value as Record<string, unknown>;
    }
  } catch {
    return {};
  }
  return {};
}

function profileFromBody(body: Record<string, unknown>) {
  const handle = normalizeHandle(String(body.handle ?? ""));
  const displayName = String(body.displayName ?? "").trim();
  const headline = String(body.headline ?? "").trim();
  const pitch = String(body.pitch ?? "").trim();
  const websiteUrl = String(body.websiteUrl ?? "").trim();
  if (!isValidHandle(handle) || !displayName || !headline || !pitch) {
    return null;
  }
  return {
    handle,
    displayName,
    headline,
    company: String(body.company ?? "").trim() || null,
    pitch,
    photoUrl: String(body.photoUrl ?? "").trim() || null,
    linkedinUrl: String(body.linkedinUrl ?? "").trim() || null,
    websiteUrl: websiteUrl || null,
  };
}

function cookieOpts(origin: string) {
  return {
    httpOnly: true,
    sameSite: "Lax" as const,
    path: "/",
    secure: origin.startsWith("https://"),
  };
}

async function establishSession(
  c: Parameters<typeof setCookie>[0],
  deps: AppDeps,
  email: string,
  now: number,
) {
  const user = await deps.store.upsertUserByEmail(email, now);
  const sid = randomToken();
  await deps.store.createSession(sid, user.id, now + 30 * 24 * 60 * 60 * 1000, now);
  setCookie(c, SESSION_COOKIE, sid, {
    ...cookieOpts(deps.config.origin),
    maxAge: 30 * 24 * 60 * 60,
  });
}

async function readSession(
  c: Parameters<typeof getCookie>[0],
  deps: AppDeps,
) {
  const sid = getCookie(c, SESSION_COOKIE);
  if (!sid) return null;
  return deps.store.getSession(sid, clock(deps), deps.config.adminEmails);
}

async function send(deps: AppDeps, to: string, subject: string, text: string) {
  if (deps.sendEmail) {
    await deps.sendEmail({ to, subject, text });
    return;
  }
  if (deps.config.resendApiKey) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${deps.config.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: deps.config.emailFrom,
        to,
        subject,
        text,
      }),
    });
  }
}

async function flushNotifications(deps: AppDeps) {
  const pending = await deps.store.takePendingNotifications(20);
  for (const item of pending) {
    try {
      await send(
        deps,
        item.email,
        `You were outbid on ${SITE.name}`,
        `Someone paid more. You are still on the board — you just moved down. Bid again at ${deps.config.origin}`,
      );
      await deps.store.markNotification(item.id, "sent", clock(deps));
    } catch {
      await deps.store.markNotification(item.id, "failed", clock(deps));
    }
  }
}

async function maybeRefund(deps: AppDeps, paymentIntentId?: string) {
  if (!deps.config.stripeSecretKey || !paymentIntentId) return;
  await fetch(`https://api.stripe.com/v1/refunds`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${deps.config.stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ payment_intent: paymentIntentId }),
  });
}

async function createStripeCheckout(input: {
  secret: string;
  origin: string;
  amountCents: number;
  handle: string;
  bidId: string;
}) {
  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${input.origin}/?bid=success`,
    cancel_url: `${input.origin}/?bid=cancel`,
    "metadata[bid_id]": input.bidId,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(input.amountCents),
    "line_items[0][price_data][product_data][name]": `workwithme.lol bid @${input.handle}`,
  });
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = (await response.json()) as { id?: string; url?: string };
  if (!data.id || !data.url) {
    throw new Error("stripe_checkout_failed");
  }
  return { id: data.id, url: data.url };
}

async function verifyTurnstile(secret: string | undefined, token: string) {
  if (!secret) return true;
  if (!token) return false;
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    },
  );
  const data = (await response.json()) as { success?: boolean };
  return Boolean(data.success);
}

async function githubEmail(
  c: Parameters<typeof getCookie>[0],
  deps: AppDeps,
): Promise<string | null> {
  if (!deps.config.githubClientId || !deps.config.githubClientSecret) {
    return null;
  }
  const expected = getCookie(c, "wmw_oauth");
  const state = c.req.query("state") ?? "";
  if (!expected || expected !== `github:${state}`) return null;
  const code = c.req.query("code") ?? "";
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: deps.config.githubClientId,
      client_secret: deps.config.githubClientSecret,
      code,
    }),
  });
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) return null;
  const emailsRes = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
      Accept: "application/json",
      "User-Agent": "workwithme.lol",
    },
  });
  const emails = (await emailsRes.json()) as Array<{
    email: string;
    primary: boolean;
    verified: boolean;
  }>;
  const picked =
    emails.find((row) => row.primary && row.verified) ??
    emails.find((row) => row.verified);
  return picked ? normalizeEmail(picked.email) : null;
}

async function googleEmail(
  c: Parameters<typeof getCookie>[0],
  deps: AppDeps,
): Promise<string | null> {
  if (!deps.config.googleClientId || !deps.config.googleClientSecret) {
    return null;
  }
  const expected = getCookie(c, "wmw_oauth");
  const state = c.req.query("state") ?? "";
  if (!expected || expected !== `google:${state}`) return null;
  const code = c.req.query("code") ?? "";
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: deps.config.googleClientId,
      client_secret: deps.config.googleClientSecret,
      redirect_uri: `${deps.config.origin}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) return null;
  const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  const user = (await userRes.json()) as { email?: string };
  return user.email ? normalizeEmail(user.email) : null;
}
