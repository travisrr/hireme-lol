import { createApp, type AppConfig } from "../src/server/app";
import { D1Store, type D1Like } from "../src/server/d1-store";

export type Bindings = {
  DB: D1Like;
  MEDIA: R2Bucket;
  ASSETS?: Fetcher;
  PUBLIC_SITE_ORIGIN: string;
  PUBLIC_SITE_NAME: string;
  BOARD_MODE: string;
  ADMIN_EMAILS?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  EMAIL_FROM?: string;
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  CF_WEB_ANALYTICS_TOKEN?: string;
};

function configFromEnv(env: Bindings): AppConfig {
  return {
    origin: env.PUBLIC_SITE_ORIGIN || "https://workwithme.lol",
    siteName: env.PUBLIC_SITE_NAME || "workwithme.lol",
    adminEmails: (env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
    githubClientId: env.GITHUB_CLIENT_ID,
    githubClientSecret: env.GITHUB_CLIENT_SECRET,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    emailFrom: env.EMAIL_FROM || "board@workwithme.lol",
    resendApiKey: env.RESEND_API_KEY,
    turnstileSecret: env.TURNSTILE_SECRET_KEY,
  };
}

function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/") || pathname.startsWith("/og/");
}

function withAnalytics(html: string, token: string): string {
  const safe = token.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safe) return html;
  const beacon = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${safe}"}'></script>`;
  if (html.includes("static.cloudflareinsights.com/beacon.min.js")) return html;
  if (html.includes("</body>")) return html.replace("</body>", `${beacon}</body>`);
  return `${html}${beacon}`;
}

async function serveAsset(request: Request, env: Bindings): Promise<Response> {
  if (!env.ASSETS) {
    return new Response("assets_unbound", { status: 500 });
  }
  const asset = await env.ASSETS.fetch(request);
  const type = asset.headers.get("content-type") ?? "";
  if (!type.includes("text/html") || !env.CF_WEB_ANALYTICS_TOKEN) {
    return asset;
  }
  const html = withAnalytics(await asset.text(), env.CF_WEB_ANALYTICS_TOKEN);
  const headers = new Headers(asset.headers);
  headers.delete("content-length");
  return new Response(html, { status: asset.status, headers });
}

export default {
  async fetch(request: Request, env: Bindings): Promise<Response> {
    const url = new URL(request.url);
    if (!isApiPath(url.pathname)) {
      return serveAsset(request, env);
    }
    if (!env.DB) {
      return Response.json({ error: "db_unbound" }, { status: 500 });
    }
    const app = createApp({
      store: new D1Store(env.DB),
      config: configFromEnv(env),
    });
    return app.fetch(request);
  },
};
