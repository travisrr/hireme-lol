import { INDUSTRIES, OVERALL_TAB } from "./industries";

const RESERVED = new Set([
  "admin",
  "api",
  "auth",
  "board",
  "how-it-works",
  "join",
  "login",
  "logout",
  "me",
  "og",
  "privacy",
  "settings",
  "terms",
  OVERALL_TAB,
  "unsubscribe",
  "www",
  ...INDUSTRIES.map((item) => item.id),
]);

export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@/, "");
}

export function isValidHandle(raw: string): boolean {
  const handle = normalizeHandle(raw);
  if (RESERVED.has(handle)) return false;
  return /^[a-z][a-z0-9_]{2,19}$/.test(handle);
}

export function handleFromName(name: string): string {
  const compact = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
  if (isValidHandle(compact)) return compact;
  const padded = `u${compact}`.replace(/[^a-z0-9]/g, "").slice(0, 20);
  return isValidHandle(padded) ? padded : "member";
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(raw));
}
