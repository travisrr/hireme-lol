import { Link } from "react-router-dom";
import { formatRelativeTime } from "../lib/time";

export type ReceiptItem = {
  id: string;
  href?: string;
  line: string;
  at: number;
};

type ReceiptCardProps = {
  title: string;
  items: ReceiptItem[];
  empty: string;
};

export function ReceiptCard({ title, items, empty }: ReceiptCardProps) {
  return (
    <section className="border border-line bg-panel p-3">
      <p className="font-mono text-[11px] tracking-[0.16em] text-mute uppercase">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-3 font-mono text-[11px] text-mute">{empty}</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-baseline justify-between gap-3 font-mono text-[11px]"
            >
              {item.href ? (
                <Link
                  to={item.href}
                  className="min-w-0 truncate text-paper no-underline hover:text-mute"
                >
                  {item.line}
                </Link>
              ) : (
                <span className="min-w-0 truncate text-paper">{item.line}</span>
              )}
              <span className="shrink-0 text-mute">
                {formatRelativeTime(item.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
