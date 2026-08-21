import { Link } from "react-router-dom";
import { formatRelativeTime } from "../lib/time";
import { PhotoTile } from "./PhotoTile";

export type ReceiptItem = {
  id: string;
  href?: string;
  line: string;
  at: number;
  photoUrl?: string | null;
  amount?: string;
  rank?: number;
};

type ReceiptCardProps = {
  title: string;
  items: ReceiptItem[];
  empty: string;
  footerHref?: string;
  footerLabel?: string;
};

export function ReceiptCard({
  title,
  items,
  empty,
  footerHref,
  footerLabel,
}: ReceiptCardProps) {
  return (
    <section className="border border-line bg-panel p-2.5">
      <p className="font-mono text-[10px] tracking-[0.14em] text-mute uppercase">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-1.5 font-mono text-[11px] text-mute">{empty}</p>
      ) : (
        <ul className="mt-1.5 grid gap-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-1.5 text-xs">
              {item.rank != null ? (
                <span className="w-3.5 shrink-0 font-mono text-[11px] text-ink tabular">
                  {item.rank}
                </span>
              ) : null}
              {item.photoUrl !== undefined ? (
                <PhotoTile src={item.photoUrl} className="size-5" />
              ) : null}
              {item.href ? (
                <Link
                  to={item.href}
                  className="min-w-0 flex-1 truncate text-ink no-underline hover:text-mute"
                >
                  {item.line}
                </Link>
              ) : (
                <span className="min-w-0 flex-1 truncate text-ink">{item.line}</span>
              )}
              {item.amount ? (
                <span className="shrink-0 font-mono text-[11px] text-ink tabular">
                  {item.amount}
                </span>
              ) : null}
              <span className="shrink-0 font-mono text-[10px] text-mute">
                {formatRelativeTime(item.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {footerHref && footerLabel ? (
        <p className="mt-1.5">
          <a
            href={footerHref}
            className="font-mono text-[11px] text-ink no-underline hover:text-mute"
          >
            {footerLabel}
          </a>
        </p>
      ) : null}
    </section>
  );
}
