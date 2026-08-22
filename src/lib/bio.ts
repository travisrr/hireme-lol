export const BIO_MAX_CHARS = 2600;
export const COMPANY_MAX_CHARS = 80;

/** Plain-text bio. Paste from LinkedIn, a résumé, or anywhere. */
export function normalizeBio(raw: string): string {
  const text = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\0/g, "")
    .replace(/<[^>]*>/g, "");
  const lines = text.split("\n").map((line) => line.replace(/[ \t]+$/g, ""));
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, BIO_MAX_CHARS);
}

export function normalizeCompany(raw: string): string | null {
  const value = raw.replace(/\s+/g, " ").trim().slice(0, COMPANY_MAX_CHARS);
  return value || null;
}

export function aboutHeading(displayName: string): string {
  const name = displayName.replace(/\s+/g, " ").trim();
  return name ? `About ${name}` : "About";
}
