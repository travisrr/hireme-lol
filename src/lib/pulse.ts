import type { ReceiptItem } from "../components/ReceiptCard";

export const PULSE_LIST_LIMIT = 5;
export const PULSE_TABS = ["trending", "activity"] as const;
export type PulseTab = (typeof PULSE_TABS)[number];

export function itemsForTab(
  tab: PulseTab,
  trending: readonly ReceiptItem[],
  activity: readonly ReceiptItem[],
): ReceiptItem[] {
  switch (tab) {
    case "trending":
      return trending.slice(0, PULSE_LIST_LIMIT);
    case "activity":
      return activity.slice(0, PULSE_LIST_LIMIT);
    default: {
      const _exhaustive: never = tab;
      return _exhaustive;
    }
  }
}

export function padPulseRows(
  items: readonly ReceiptItem[],
): Array<ReceiptItem | null> {
  const rows: Array<ReceiptItem | null> = items.slice(0, PULSE_LIST_LIMIT);
  while (rows.length < PULSE_LIST_LIMIT) {
    rows.push(null);
  }
  return rows;
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
