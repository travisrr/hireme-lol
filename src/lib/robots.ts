/** Plain-text robots. No sitemap — none exists. */
export const ROBOTS_TXT = "User-agent: *\nAllow: /\n";

export const ROBOTS_HEADERS = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "public, max-age=3600",
} as const;
