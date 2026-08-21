import { Link } from "react-router-dom";
import { formatUsdFromCents } from "../lib/money";
import { assertNever } from "../lib/ranking";
import type { BoardActivity, EventType } from "../lib/types";

export function ActivityRail({ items }: { items: BoardActivity[] }) {
  return (
    <aside className="border border-line bg-panel p-4">
      <p className="font-mono text-[11px] tracking-wide text-money uppercase">
        Latest activity
      </p>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={item.id} className="text-sm">
            {item.handle ? (
              <Link
                to={`/${item.handle}`}
                className="text-paper no-underline hover:text-money"
              >
                {item.displayName}
              </Link>
            ) : (
              <span>{item.displayName}</span>
            )}
            <p className="font-mono text-[11px] text-mute">
              {labelFor(item.type)}
              {item.amountCents !== null
                ? ` · ${formatUsdFromCents(item.amountCents)}`
                : ""}
              {item.rankAfter !== null ? ` · #${item.rankAfter}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function labelFor(type: EventType): string {
  switch (type) {
    case "joined":
      return "joined the board";
    case "bid_confirmed":
      return "bid";
    case "outbid":
      return "got outbid";
    case "refunded":
      return "refunded";
    case "listing_hidden":
      return "hidden";
    case "listing_unhidden":
      return "unhidden";
    default:
      return assertNever(type);
  }
}
