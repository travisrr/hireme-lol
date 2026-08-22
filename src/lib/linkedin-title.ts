export function parseLinkedinTitleParts(title: string): {
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

const TITLE_JUNK = /^(linkedin|view profile|member)$/i;

export function inferLinkedinTitle(
  headline?: string | null,
  extra: { title?: string | null; occupation?: string | null } = {},
): string {
  for (const blob of [headline, extra.occupation, extra.title]) {
    const inferred = titleFromLinkedinText(blob);
    if (inferred) return inferred;
  }
  return "";
}

function titleFromLinkedinText(raw?: string | null): string {
  const text = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (/\s-\s/.test(text) || /\|\s*LinkedIn\s*$/i.test(text)) {
    const parts = parseLinkedinTitleParts(text);
    if (parts.headline) return shortenLinkedinRole(parts.headline);
  }
  return shortenLinkedinRole(text);
}

function shortenLinkedinRole(text: string): string {
  const first = (text.split(/(?<=\.)\s+(?=[A-Z])/)[0] ?? text).trim();
  const at = /\s+at\s+/i.exec(first);
  let role = (at ? first.slice(0, at.index) : first).trim();
  role = (role.split("|")[0] ?? "").replace(/[.,;:]+$/, "").trim();
  if (!role || TITLE_JUNK.test(role)) return "";
  return role;
}

export function parseLinkedinMemberProfile(input: unknown): {
  headline: string;
  vanityName: string;
} {
  const row =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  const vanityName =
    typeof row.vanityName === "string" ? row.vanityName.trim() : "";
  const localized =
    typeof row.localizedHeadline === "string" ? row.localizedHeadline.trim() : "";
  return {
    headline: inferLinkedinTitle(localized || localeString(row.headline)),
    vanityName,
  };
}

function localeString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const localized = (value as { localized?: Record<string, unknown> }).localized;
  if (!localized || typeof localized !== "object") return "";
  for (const item of Object.values(localized)) {
    if (typeof item === "string" && item.trim()) return item.trim();
  }
  return "";
}
