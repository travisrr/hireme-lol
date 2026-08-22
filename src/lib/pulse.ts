import type { ReceiptItem } from "../components/ReceiptCard";
import { formatUsdFromCents } from "./money";
import { fillPulseRows, pulseTrendingLine, seededActivity } from "./pulse-seed";
import { formatRelativeTime } from "./time";

export const PULSE_LIST_LIMIT = 5;
export const PULSE_ROW_PX = 36;
export const TRENDING_REFRESH_MS = 15_000;
export const PULSE_TABS = ["trending", "activity"] as const;
export type PulseTab = (typeof PULSE_TABS)[number];

export type TrendingListing = {
  id: string;
  handle: string;
  displayName: string;
  photoUrl: string | null;
  rank: number;
  currentBidCents: number;
  currentBidAt: number;
};

export function trendingFromListings(
  listings: readonly TrendingListing[],
  now = Date.now(),
): ReceiptItem[] {
  return listings.slice(0, PULSE_LIST_LIMIT).map((listing) => {
    const amount = formatUsdFromCents(listing.currentBidCents);
    const time = formatRelativeTime(listing.currentBidAt, now);
    return {
      id: listing.id,
      href: `/${listing.handle}`,
      photoUrl: listing.photoUrl,
      name: listing.displayName,
      rank: listing.rank,
      amount,
      time,
      at: listing.currentBidAt,
      line: pulseTrendingLine(listing.displayName, listing.rank, amount, time),
    };
  });
}

export function itemsForTab(
  tab: PulseTab,
  trending: readonly ReceiptItem[],
  activity: readonly ReceiptItem[],
): ReceiptItem[] {
  switch (tab) {
    case "trending":
      return trending.slice(0, PULSE_LIST_LIMIT);
    case "activity":
      return fillPulseRows(activity, seededActivity());
    default: {
      const _exhaustive: never = tab;
      return _exhaustive;
    }
  }
}

export function padPulseRows(
  items: readonly ReceiptItem[],
): ReceiptItem[] {
  return fillPulseRows(items, seededActivity());
}

export function pulseTabLabel(tab: PulseTab): string {
  switch (tab) {
    case "trending":
      return "Trending";
    case "activity":
      return "Activity";
    default: {
      const _exhaustive: never = tab;
      return _exhaustive;
    }
  }
}

export function pulseEmptyCopy(tab: PulseTab): string {
  switch (tab) {
    case "trending":
      return "No movement yet.";
    case "activity":
      return "No receipts yet.";
    default: {
      const _exhaustive: never = tab;
      return _exhaustive;
    }
  }
}

export function pulseRowParts(item: ReceiptItem): {
  name: string;
  rank: string;
  amount: string;
  time: string;
} {
  if (
    item.name &&
    item.rank != null &&
    item.amount != null &&
    item.time != null
  ) {
    return {
      name: item.name,
      rank: `#${item.rank}`,
      amount: item.amount,
      time: item.time,
    };
  }
  const bits = item.line.split("·").map((part) => part.trim());
  const rank = bits[1] ?? "";
  return {
    name: bits[0] || item.line,
    rank: rank.startsWith("#") || rank.length === 0 ? rank : `#${rank}`,
    amount: bits[2] ?? "",
    time: bits[3] ?? "",
  };
}
