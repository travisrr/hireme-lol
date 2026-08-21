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
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
        <Link
          to="/"
          aria-label={SITE.name}
          className="flex items-baseline no-underline"
        >
          <span className="font-display text-xl tracking-tight text-ink uppercase sm:text-2xl">
            {SITE.wordmark}
          </span>
          <span className="font-mono text-xs font-medium text-ink sm:text-sm">
            {SITE.tld}
          </span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {showSearch ? (
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search people or headlines</span>
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search people or headlines..."
                className="w-full border border-line bg-paper px-3 py-2 font-mono text-xs text-ink outline-none placeholder:text-mute focus:border-ink"
              />
            </label>
          ) : (
            <span className="flex-1" />
          )}
          <button
            type="button"
            onClick={onCta}
            className="shrink-0 bg-ink px-3 py-2 font-mono text-[11px] font-semibold tracking-wide text-paper uppercase"
          >
            {SITE.cta}
          </button>
        </div>
      </div>
    </header>
  );
}
