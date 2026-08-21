import { readFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import type { Plugin } from "vite";
import { MemoryMedia } from "./src/lib/media";
import { createApp, type AppConfig } from "./src/server/app";
import { seedLockShotBoard } from "./src/server/lock-shot-seed";
import { MemoryStore } from "./src/server/memory-store";

const store = new MemoryStore();
const media = new MemoryMedia();

function config(): AppConfig {
  return {
    origin: process.env.VITE_PUBLIC_SITE_ORIGIN || "http://localhost:5173",
    siteName: "workwithme.lol",
    adminEmails: (process.env.ADMIN_EMAILS ?? "tcrxx0@gmail.com")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    emailFrom: process.env.EMAIL_FROM || "board@workwithme.lol",
    resendApiKey: process.env.RESEND_API_KEY,
    turnstileSecret: process.env.TURNSTILE_SECRET_KEY,
  };
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk as Buffer));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export function localApi(): Plugin {
  return {
    name: "workwithme-local-api",
    configureServer(server) {
      const seeded =
        process.env.LOCK_SHOTS === "1"
          ? seedLockShotBoard(store)
          : Promise.resolve();
      const app = createApp({ store, config: config(), media });
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "";
        if (
          process.env.LOCK_SHOTS === "1" &&
          pathname.startsWith("/lock-shots/")
        ) {
          const name = pathname.slice("/lock-shots/".length);
          if (!/^[a-z]+\.jpg$/.test(name)) {
            res.statusCode = 404;
            res.end();
            return;
          }
          try {
            const bytes = await readFile(join("lock-shots", name));
            res.setHeader("content-type", "image/jpeg");
            res.end(bytes);
          } catch {
            res.statusCode = 404;
            res.end();
          }
          return;
        }
        if (!pathname.startsWith("/api")) {
          next();
          return;
        }
        try {
          await seeded;
          await pipeToHono(app, req, res);
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "local_api_failed" }));
        }
      });
    },
  };
}

async function pipeToHono(
  app: ReturnType<typeof createApp>,
  req: IncomingMessage,
  res: ServerResponse,
) {
  const host = req.headers.host ?? "localhost:5173";
  const url = `http://${host}${req.url}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(", "));
  }
  const method = req.method ?? "GET";
  const init: RequestInit = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    init.body = new Uint8Array(await readBody(req));
  }
  const response = await app.fetch(new Request(url, init));
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.end(Buffer.from(await response.arrayBuffer()));
}
