import type { ReceiptItem } from "../components/ReceiptCard";
import { fillPulseRows, seededActivity, seededTrending } from "./pulse-seed";

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
      return fillPulseRows(trending, seededTrending());
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
