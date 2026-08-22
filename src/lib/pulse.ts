import type { ReceiptItem } from "../components/ReceiptCard";
import {
  fillPulseRows,
  fillUniquePeople,
  seededActivity,
  seededTrending,
} from "./pulse-seed";

export const PULSE_LIST_LIMIT = 5;
export const PULSE_ROW_PX = 40;
export const PULSE_TABS = ["trending", "activity"] as const;
export type PulseTab = (typeof PULSE_TABS)[number];

export function itemsForTab(
  tab: PulseTab,
  trending: readonly ReceiptItem[],
  activity: readonly ReceiptItem[],
): ReceiptItem[] {
  switch (tab) {
    case "trending":
      return fillUniquePeople(trending, seededTrending());
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
    item.amount &&
    item.time
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
