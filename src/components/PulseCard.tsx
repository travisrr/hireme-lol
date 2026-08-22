import { Link } from "react-router-dom";
import { itemsForTab, pulseRowParts } from "../lib/pulse";
import { PhotoTile } from "./PhotoTile";
import type { ReceiptItem } from "./ReceiptCard";

type PulseCardProps = {
  trending: readonly ReceiptItem[];
};

export function PulseCard({ trending }: PulseCardProps) {
  const items = itemsForTab("trending", trending, []);

  return (
    <div className="hero-pulse-cell">
      <section data-lock="hero-pulse" className="hero-pulse">
        <p className="hero-pulse-title">Trending</p>
        <ul className="hero-pulse-list">
          {items.map((item) => (
            <PulseRow key={item.id} item={item} />
          ))}
        </ul>
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
  const parts = pulseRowParts(item);
  const name = item.href ? (
    <Link to={item.href} className="hero-pulse-name">
      {parts.name}
    </Link>
  ) : (
    <span className="hero-pulse-name">{parts.name}</span>
  );

  return (
    <li className="hero-pulse-row">
      <PhotoTile
        src={item.photoUrl ?? null}
        className="pulse-photo"
        radius={12}
      />
      {name}
      <span className="hero-pulse-meta">{parts.rank}</span>
      <span className="hero-pulse-meta">{parts.amount}</span>
      <span className="hero-pulse-meta">{parts.time}</span>
    </li>
  );
}
