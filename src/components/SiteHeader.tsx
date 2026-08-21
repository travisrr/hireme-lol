import { Link } from "react-router-dom";
import { SITE } from "../lib/site";

type SiteHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onCta: () => void;
  showSearch?: boolean;
};

export function SiteHeader({
  query,
  onQueryChange,
  onCta,
  showSearch = true,
}: SiteHeaderProps) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex items-baseline gap-2 no-underline">
          <span className="font-display text-2xl tracking-tight text-paper">
            {SITE.wordmark}
          </span>
          <span className="font-mono text-sm font-semibold text-money">
            {SITE.tld}
          </span>
        </Link>
        <div className="flex flex-1 items-center gap-2 sm:max-w-xl sm:justify-end">
          {showSearch ? (
            <label className="relative min-w-0 flex-1 sm:max-w-xs">
              <span className="sr-only">Search the board</span>
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search name, company, pitch…"
                className="w-full rounded-sm border border-line bg-panel px-3 py-2 font-mono text-xs text-paper outline-none placeholder:text-mute focus:border-money"
              />
            </label>
          ) : null}
          <button
            type="button"
            onClick={onCta}
            className="shrink-0 rounded-sm bg-money px-3 py-2 font-mono text-[11px] font-semibold tracking-wide text-ink uppercase hover:bg-paper"
          >
            {SITE.cta}
          </button>
        </div>
      </div>
    </header>
  );
}
