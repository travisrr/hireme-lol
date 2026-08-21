export type LinkedinUserinfo = {
  displayName: string;
  photoUrl: string;
  headline: string;
  email: string;
};

export function linkedinAuthorizeUrl(opts: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", opts.clientId);
  url.searchParams.set("redirect_uri", opts.redirectUri);
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", opts.state);
  return url.toString();
}

export function parseLinkedinUserinfo(input: unknown): LinkedinUserinfo {
  const row =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  const name = typeof row.name === "string" ? row.name.trim() : "";
  const given = typeof row.given_name === "string" ? row.given_name.trim() : "";
  const family =
    typeof row.family_name === "string" ? row.family_name.trim() : "";
  const displayName = name || [given, family].filter(Boolean).join(" ");
  const photoUrl = typeof row.picture === "string" ? row.picture.trim() : "";
  const email = typeof row.email === "string" ? row.email.trim() : "";
  // LinkedIn userinfo usually has no headline. Never invent one.
  const headline = typeof row.headline === "string" ? row.headline.trim() : "";
  return { displayName, photoUrl, headline, email };
}

export function requestHostOrigin(url: string, fallback: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.host.toLowerCase();
    if (host === "workwithme.lol" || host === "www.workwithme.lol") {
      return `${parsed.protocol}//${parsed.host}`;
    }
    if (host === "localhost:5173" || host === "127.0.0.1:5173") {
      return `${parsed.protocol}//${parsed.host}`;
    }
  } catch {
    // Use the configured public origin.
  }
  return fallback;
}
