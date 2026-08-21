const RESERVED = new Set([
  "admin",
  "api",
  "auth",
  "login",
  "logout",
  "me",
  "og",
  "unsubscribe",
  "www",
]);

export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@/, "");
}

export function isValidHandle(raw: string): boolean {
  const handle = normalizeHandle(raw);
  if (RESERVED.has(handle)) return false;
  return /^[a-z][a-z0-9_]{2,19}$/.test(handle);
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(raw));
}
