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
    <header className="sticky top-0 z-40 border-b border-line bg-ink">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
        <Link
          to="/"
          aria-label={SITE.name}
          className="flex items-baseline no-underline"
        >
          <span className="font-display text-xl tracking-tight text-paper uppercase sm:text-2xl">
            {SITE.wordmark}
          </span>
          <span className="font-mono text-xs font-medium text-paper sm:text-sm">
            {SITE.tld}
          </span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:justify-end">
          {showSearch ? (
            <label className="relative min-w-0 flex-1 sm:max-w-sm">
              <span className="sr-only">Search the board</span>
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search the board"
                className="w-full border border-line bg-ink px-3 py-2 font-mono text-xs text-paper outline-none placeholder:text-mute focus:border-paper"
              />
            </label>
          ) : null}
          <button
            type="button"
            onClick={onCta}
            className="shrink-0 bg-paper px-3 py-2 font-mono text-[11px] font-semibold tracking-wide text-ink uppercase hover:bg-mute"
          >
            {SITE.cta}
          </button>
        </div>
      </div>
    </header>
  );
}
