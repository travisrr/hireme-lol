/** Founding seed only: Elon / Palmer / Jensen. Real founding-badge bidders are not seed. */
export const SEED_HANDLES = ["elon", "palmer", "jensen"] as const;

const SEED_HANDLE_SET = new Set<string>(SEED_HANDLES);
const SEED_ID = /(?:lst|prf|usr)_founding_(?:elon|palmer|jensen)$/i;
const MINUTE = 60_000;

export type ProfileViewListing = {
  handle: string;
  id: string;
  rank: number;
  currentBidCents: number;
  profileCreatedAt: number;
  profileClicks?: number | null;
};

export function isSeedBidder(input: {
  handle?: string | null;
  id?: string | null;
}): boolean {
  const handle = (input.handle ?? "").trim().toLowerCase();
  if (SEED_HANDLE_SET.has(handle)) return true;
  return SEED_ID.test((input.id ?? "").trim());
}

/** Stable 0–n from a listing id so two bidders at the same rank don't match. */
function mix(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Display-only profile views for the homepage. Never written to D1.
 * Seed users stay off the counter. Real `profileClicks` still add on top.
 */
export function fakeProfileViews(
  listing: ProfileViewListing,
  now = Date.now(),
): number | null {
  if (isSeedBidder(listing)) return null;
  const minutes = Math.max(
    0,
    Math.floor((now - listing.profileCreatedAt) / MINUTE),
  );
  const rank = Math.max(1, listing.rank);
  const rankWeight = Math.max(0, 14 - rank);
  const jitter = mix(listing.id) % 23;
  const launch = 18 + rankWeight * 9 + jitter;
  const perHour = 3 + rankWeight;
  const drip = Math.floor((minutes * perHour) / 60);
  const bidNudge = Math.floor(Math.max(0, listing.currentBidCents) / 200);
  const real = Math.max(0, listing.profileClicks ?? 0);
  return launch + drip + bidNudge + real;
}
