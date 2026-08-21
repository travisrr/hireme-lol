import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { parsePaddleEnvironment } from "./src/lib/paddle";
import { createApp, type AppConfig } from "./src/server/app";
import { MemoryStore } from "./src/server/memory-store";

const store = new MemoryStore();

function config(): AppConfig {
  return {
    origin: process.env.VITE_PUBLIC_SITE_ORIGIN || "http://localhost:5173",
    siteName: "workwithme.lol",
    adminEmails: (process.env.ADMIN_EMAILS ?? "tcrxx0@gmail.com")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
    paddleApiKey: process.env.PADDLE_API_KEY,
    paddleWebhookSecret: process.env.PADDLE_WEBHOOK_SECRET,
    paddleClientToken: process.env.PADDLE_CLIENT_TOKEN,
    paddleEnvironment: parsePaddleEnvironment(process.env.PADDLE_ENVIRONMENT),
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
      const app = createApp({ store, config: config() });
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api")) {
          next();
          return;
        }
        try {
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
