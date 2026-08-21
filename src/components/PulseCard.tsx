import { useState } from "react";
import { Link } from "react-router-dom";
import {
  itemsForTab,
  pulseEmptyCopy,
  pulseTabLabel,
  PULSE_TABS,
  type PulseTab,
} from "../lib/pulse";
import { PhotoTile } from "./PhotoTile";
import type { ReceiptItem } from "./ReceiptCard";

type PulseCardProps = {
  trending: readonly ReceiptItem[];
  activity: readonly ReceiptItem[];
};

export function PulseCard({ trending, activity }: PulseCardProps) {
  const [tab, setTab] = useState<PulseTab>("trending");
  const items = itemsForTab(tab, trending, activity);
  const empty = pulseEmptyCopy(tab);

  return (
    <div className="hero-pulse-cell">
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
          {items.map((item) => (
            <PulseRow key={item.id} item={item} />
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
    </div>
  );
}

function PulseRow({ item }: { item: ReceiptItem }) {
  return (
    <li className="hero-pulse-row">
      <PhotoTile src={item.photoUrl ?? null} className="size-5" radius={4} />
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
    </li>
  );
}
