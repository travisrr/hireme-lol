import { Hono } from "hono";
import { cors } from "hono/cors";

export type Bindings = {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
  PUBLIC_SITE_ORIGIN: string;
  PUBLIC_SITE_NAME: string;
  BOARD_MODE: string;
};

const app = new Hono<{ Bindings: Bindings }>();

const LOCAL_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use("/api/*", async (c, next) => {
  const origin = c.env.PUBLIC_SITE_ORIGIN || "https://workwithme.lol";
  const middleware = cors({
    origin: [origin, "https://www.workwithme.lol", ...LOCAL_ORIGINS],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });
  return middleware(c, next);
});

app.get("/api/health", (c) => {
  return c.json({
    ok: true,
    site: c.env.PUBLIC_SITE_NAME ?? "workwithme.lol",
    origin: c.env.PUBLIC_SITE_ORIGIN ?? "https://workwithme.lol",
    boardMode: c.env.BOARD_MODE ?? "global_only",
    preview: true,
    note: "Founding preview. hireme.lol is not a deploy target.",
  });
});

app.get("/api/config", (c) => {
  return c.json({
    minEntryCents: 500,
    minIncrementCents: 100,
    publicOrigin: c.env.PUBLIC_SITE_ORIGIN ?? "https://workwithme.lol",
    boardId: "global",
    foundingPreview: true,
  });
});

app.all("/api/*", (c) => {
  return c.json(
    {
      error: "not_implemented",
      message:
        "Live auth, D1 board, and Stripe webhooks are next. This Worker is the workwithme.lol origin stub.",
    },
    501,
  );
});

export default app;
