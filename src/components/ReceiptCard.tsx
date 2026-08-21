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
    <section className="rounded-[12px] border border-line bg-card p-3">
      <p className="text-[10px] font-bold tracking-[0.14em] text-mute uppercase">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="type-meta mt-1.5 text-mute">{empty}</p>
      ) : (
        <ul className="mt-1.5 grid gap-1">
          {items.map((item) => {
            const relative = formatRelativeTime(item.at);
            return (
              <li key={item.id} className="flex items-center gap-1.5 text-xs">
                {item.rank != null ? (
                  <span className="w-3.5 shrink-0 text-[11px] font-bold text-accent tabular">
                    {item.rank}
                  </span>
                ) : null}
                {item.photoUrl !== undefined ? (
                  <PhotoTile src={item.photoUrl} className="size-5" />
                ) : null}
                {item.href ? (
                  <Link
                    to={item.href}
                    className="min-w-0 flex-1 truncate text-ink no-underline hover:text-accent"
                  >
                    {item.line}
                  </Link>
                ) : (
                  <span className="min-w-0 flex-1 truncate text-ink">
                    {item.line}
                  </span>
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
          })}
        </ul>
      )}
      {footerHref && footerLabel ? (
        <p className="mt-1.5">
          <a
            href={footerHref}
            className="text-[11px] font-semibold text-accent no-underline hover:text-accent-hover"
          >
            {footerLabel}
          </a>
        </p>
      ) : null}
    </section>
  );
}
