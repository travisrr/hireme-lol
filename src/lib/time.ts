const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const RECENT_BID_MS = 90_000;

export function formatRelativeTime(createdAt: number, now = Date.now()): string {
  const delta = Math.max(0, now - createdAt);
  if (delta < MINUTE) return "just now";
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)}m ago`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)}h ago`;
  return `${Math.floor(delta / DAY)}d ago`;
}

export function isRecentBid(at: number, now = Date.now()): boolean {
  return now - at >= 0 && now - at < RECENT_BID_MS;
}
