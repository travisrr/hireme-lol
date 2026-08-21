export type PulledLinkedin = {
  linkedinUrl: string;
  slug: string;
  displayName: string;
  headline: string;
  company: string;
  ogImageUrl: string | null;
};

const PROFILE_PATH = /^\/in\/([a-zA-Z0-9._%-]+)\/?$/;

export function normalizeLinkedinProfileUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "linkedin.com") return null;
    const match = PROFILE_PATH.exec(url.pathname);
    if (!match) return null;
    const slug = decodeURIComponent(match[1]).replace(/\/+$/, "");
    if (!slug) return null;
    return `https://www.linkedin.com/in/${slug}`;
  } catch {
    return null;
  }
}

export function linkedinSlug(url: string): string | null {
  const normalized = normalizeLinkedinProfileUrl(url);
  if (!normalized) return null;
  return normalized.slice("https://www.linkedin.com/in/".length);
}

export function handleFromLinkedinSlug(slug: string): string {
  const compact = slug
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
  if (/^[a-z][a-z0-9]{2,19}$/.test(compact)) return compact;
  return `in${compact}`.replace(/[^a-z0-9]/g, "").slice(0, 20) || "member";
}

function metaContent(html: string, keys: string[]): string | null {
  for (const key of keys) {
    const property = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i",
    );
    const contentFirst = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
      "i",
    );
    const match = property.exec(html) ?? contentFirst.exec(html);
    if (match?.[1]) return decodeHtml(match[1].trim());
  }
  return null;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseTitleParts(title: string): {
  displayName: string;
  headline: string;
  company: string;
} {
  const cleaned = title.replace(/\s*\|\s*LinkedIn\s*$/i, "").trim();
  const [namePart, ...rest] = cleaned.split(" - ");
  const displayName = (namePart || "").trim();
  const after = rest.join(" - ").trim();
  let headline = after;
  let company = "";
  const at = /\s+at\s+(.+)$/i.exec(after);
  if (at) {
    company = at[1].trim();
    headline = after.slice(0, at.index).trim();
  }
  return { displayName, headline, company };
}

export function parseLinkedinHtml(html: string, pageUrl: string): PulledLinkedin {
  const normalized = normalizeLinkedinProfileUrl(pageUrl);
  if (!normalized) {
    throw new Error("invalid_linkedin_url");
  }
  const slug = linkedinSlug(normalized) ?? "";
  const title =
    metaContent(html, ["og:title", "twitter:title"]) ||
    /<title>([^<]+)<\/title>/i.exec(html)?.[1] ||
    "";
  const parts = parseTitleParts(decodeHtml(title));
  const image = metaContent(html, ["og:image", "og:image:url", "twitter:image"]);
  let ogImageUrl: string | null = null;
  if (image) {
    try {
      ogImageUrl = new URL(image, normalized).toString();
    } catch {
      ogImageUrl = null;
    }
  }
  const description = metaContent(html, ["og:description", "description"]) ?? "";
  if (!parts.company && description) {
    const companyGuess = /(?:at|@)\s+([^·|\n]+)/i.exec(description);
    if (companyGuess) parts.company = companyGuess[1].trim();
  }
  return {
    linkedinUrl: normalized,
    slug,
    displayName: parts.displayName,
    headline: parts.headline,
    company: parts.company,
    ogImageUrl,
  };
}
