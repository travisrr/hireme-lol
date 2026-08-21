import { formatUsdFromCents } from "./money";
import { assertNever } from "./ranking";
import type { BoardActivity, EventType } from "./types";

export function receiptKind(type: EventType): "outbid" | "claim" | "other" {
  switch (type) {
    case "outbid":
      return "outbid";
    case "joined":
    case "bid_confirmed":
      return "claim";
    case "refunded":
    case "listing_hidden":
    case "listing_unhidden":
      return "other";
    default:
      return assertNever(type);
  }
}

export function receiptLine(item: BoardActivity): string {
  const rank = item.rankAfter !== null ? `#${item.rankAfter}` : null;
  const amount =
    item.amountCents !== null ? formatUsdFromCents(item.amountCents) : null;

  switch (item.type) {
    case "outbid":
      return ["Outbid", rank ? `on ${rank}` : null, amount ? `New bid: ${amount}` : null]
        .filter((part): part is string => part !== null)
        .join(" / ")
        .replace("Outbid / on ", "Outbid on ");
    case "joined":
    case "bid_confirmed":
      return ["Claimed", rank, amount]
        .filter((part): part is string => part !== null)
        .join(" / ");
    case "refunded":
      return ["Refunded", amount].filter((part): part is string => part !== null).join(" / ");
    case "listing_hidden":
      return ["Hidden", rank].filter((part): part is string => part !== null).join(" / ");
    case "listing_unhidden":
      return ["Unhidden", rank].filter((part): part is string => part !== null).join(" / ");
    default:
      return assertNever(item.type);
  }
}
