const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export const RECENT_BID_MS = 90_000;
export const RELATIVE_TIME_HIDE_AFTER_MS = 14 * DAY;

export function formatRelativeTime(createdAt: number, now = Date.now()): string {
  const delta = Math.max(0, now - createdAt);
  if (delta >= RELATIVE_TIME_HIDE_AFTER_MS) return "";
  if (delta < MINUTE) return "just now";
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)}m ago`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)}h ago`;
  if (delta < WEEK) return `${Math.floor(delta / DAY)}d ago`;
  return `${Math.floor(delta / WEEK)}w ago`;
}

export function isRecentBid(at: number, now = Date.now()): boolean {
  return now - at >= 0 && now - at < RECENT_BID_MS;
}
