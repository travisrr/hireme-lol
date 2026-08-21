export type BeaconEnv = {
  CF_BEACON_TOKEN?: string;
  CF_WEB_ANALYTICS_TOKEN?: string;
};

export function resolveBeaconToken(env: BeaconEnv): string | undefined {
  const raw = env.CF_WEB_ANALYTICS_TOKEN || env.CF_BEACON_TOKEN;
  if (!raw) return undefined;
  const safe = raw.replace(/[^a-zA-Z0-9_-]/g, "");
  return safe || undefined;
}

/** Same JS beacon Travis uses on docu-coach. Omitted when the token is missing. */
export function injectWebAnalyticsBeacon(html: string, token: string): string {
  const safe = token.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safe) return html;
  if (html.includes("static.cloudflareinsights.com/beacon.min.js")) return html;
  const beacon = `<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "${safe}"}'></script>`;
  if (html.includes("</body>")) return html.replace("</body>", `${beacon}\n</body>`);
  return `${html}${beacon}`;
}
