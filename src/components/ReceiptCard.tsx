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
    <section className="rounded-[12px] border border-line bg-card p-3.5">
      <p className="text-xs font-semibold tracking-wide text-mute uppercase">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2.5 text-sm text-mute">{empty}</p>
      ) : (
        <ul className="mt-2.5 grid gap-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-sm">
              {item.rank != null ? (
                <span className="w-4 shrink-0 text-sm font-bold text-accent tabular">
                  {item.rank}
                </span>
              ) : null}
              {item.photoUrl !== undefined ? (
                <PhotoTile src={item.photoUrl} className="size-6" />
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
                <span className="shrink-0 font-semibold text-accent tabular">
                  {item.amount}
                </span>
              ) : null}
              <span className="shrink-0 text-xs text-mute">
                {formatRelativeTime(item.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {footerHref && footerLabel ? (
        <p className="mt-3">
          <a
            href={footerHref}
            className="text-sm font-semibold text-accent no-underline hover:text-accent-hover"
          >
            {footerLabel}
          </a>
        </p>
      ) : null}
    </section>
  );
}
