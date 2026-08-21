export type ClickTarget = "profile" | "linkedin" | "site";

export function totalClicks(input: {
  profileClicks?: number | null;
  linkedinClicks?: number | null;
  websiteClicks?: number | null;
}): number {
  return (
    (input.profileClicks ?? 0) +
    (input.linkedinClicks ?? 0) +
    (input.websiteClicks ?? 0)
  );
}

export function isClickTarget(value: string): value is ClickTarget {
  return value === "profile" || value === "linkedin" || value === "site";
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";
  return `${first}${last}`.toUpperCase();
}
