export const HSTS_HEADER = "max-age=31536000; includeSubDomains";

const PUBLIC_HOSTS = new Set(["workwithme.lol", "www.workwithme.lol"]);

export function isPublicSiteHost(hostname: string): boolean {
  return PUBLIC_HOSTS.has(hostname.toLowerCase());
}

/** 301 HTTP → HTTPS for apex and www. Localhost and workers.dev stay put. */
export function httpsRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  if (!isPublicSiteHost(url.hostname)) return null;
  if (url.protocol !== "http:") return null;
  url.protocol = "https:";
  return new Response(null, {
    status: 301,
    headers: {
      Location: url.href,
      "Strict-Transport-Security": HSTS_HEADER,
    },
  });
}

export function withHsts(response: Response, request: Request): Response {
  const url = new URL(request.url);
  if (!isPublicSiteHost(url.hostname)) return response;
  if (response.headers.get("Strict-Transport-Security") === HSTS_HEADER) {
    return response;
  }
  const headers = new Headers(response.headers);
  headers.set("Strict-Transport-Security", HSTS_HEADER);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
