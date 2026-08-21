import { useState } from "react";
import { Link } from "react-router-dom";
import {
  itemsForTab,
  padPulseRows,
  pulseEmptyCopy,
  pulseTabLabel,
  PULSE_TABS,
  type PulseTab,
} from "../lib/pulse";
import { formatRelativeTime } from "../lib/time";
import { PhotoTile } from "./PhotoTile";
import type { ReceiptItem } from "./ReceiptCard";

type PulseCardProps = {
  trending: readonly ReceiptItem[];
  activity: readonly ReceiptItem[];
};

export function PulseCard({ trending, activity }: PulseCardProps) {
  const [tab, setTab] = useState<PulseTab>("trending");
  const items = itemsForTab(tab, trending, activity);
  const rows = padPulseRows(items);
  const empty = pulseEmptyCopy(tab);

  return (
    <section data-lock="hero-pulse" className="hero-pulse">
      <div className="pulse-tabs" role="tablist" aria-label="Board pulse">
        {PULSE_TABS.map((id, index) => (
          <span key={id} className="contents">
            {index > 0 ? (
              <span className="pulse-tab-rule" aria-hidden="true">
                |
              </span>
            ) : null}
            <button
              type="button"
              role="tab"
              aria-selected={tab === id}
              data-active={tab === id ? "true" : "false"}
              className="pulse-tab"
              onClick={() => setTab(id)}
            >
              {pulseTabLabel(id)}
            </button>
          </span>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="type-meta hero-pulse-empty text-mute">{empty}</p>
      ) : (
        <ul className="hero-pulse-list">
          {rows.map((item, index) => (
            <PulseRow key={item?.id ?? `empty-${index}`} item={item} />
          ))}
        </ul>
      )}
      <p className="hero-pulse-foot">
        <a
          href="#board"
          className="text-[11px] font-semibold text-accent no-underline hover:text-accent-hover"
        >
          View →
        </a>
      </p>
    </section>
  );
}

function PulseRow({ item }: { item: ReceiptItem | null }) {
  if (!item) {
    return <li className="hero-pulse-row" aria-hidden="true" />;
  }
  const relative = formatRelativeTime(item.at);
  return (
    <li className="hero-pulse-row">
      {item.rank != null ? (
        <span className="w-3.5 shrink-0 text-[11px] font-bold text-accent tabular">
          {item.rank}
        </span>
      ) : null}
      {item.photoUrl !== undefined ? (
        <PhotoTile src={item.photoUrl} className="size-5" radius={4} />
      ) : null}
      {item.href ? (
        <Link
          to={item.href}
          className="min-w-0 flex-1 truncate text-ink no-underline hover:text-accent"
        >
          {item.line}
        </Link>
      ) : (
        <span className="min-w-0 flex-1 truncate text-ink">{item.line}</span>
      )}
      {item.amount ? (
        <span className="shrink-0 text-[11px] font-bold text-accent tabular">
          {item.amount}
        </span>
      ) : null}
      {relative ? (
        <span className="type-meta shrink-0 text-mute">{relative}</span>
      ) : null}
    </li>
  );
}
