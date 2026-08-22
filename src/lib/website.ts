const HTTP_PROTOCOL = /^https?:$/i;

export function normalizeWebsiteUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^[a-zA-Z][a-zA-Z+.-]*:/.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(withProtocol);
    if (!HTTP_PROTOCOL.test(url.protocol)) return null;
    if (!url.hostname.includes(".")) return null;
    url.hash = "";
    if (url.pathname === "/" && !url.search) return url.origin;
    return url.toString();
  } catch {
    return null;
  }
}
