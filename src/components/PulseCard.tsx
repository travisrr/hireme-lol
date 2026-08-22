import { Link } from "react-router-dom";
import { itemsForTab, pulseEmptyCopy, pulseRowParts } from "../lib/pulse";
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
        {items.length === 0 ? (
          <p className="hero-pulse-empty type-body text-mute">
            {pulseEmptyCopy("trending")}
          </p>
        ) : (
          <ul className="hero-pulse-list">
            {items.map((item) => (
              <PulseRow key={item.id} item={item} />
            ))}
          </ul>
        )}
        <div className="hero-pulse-foot">
          <a href="#board">View →</a>
        </div>
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
        radius={8}
      />
      {name}
      <span className="hero-pulse-stats">
        <span className="hero-pulse-rank">{parts.rank}</span>
        <span className="hero-pulse-amount">{parts.amount}</span>
        <span className="hero-pulse-time">{parts.time}</span>
      </span>
    </li>
  );
}
