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
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <Link
          to="/"
          aria-label={SITE.name}
          className="shrink-0 text-[17px] font-bold tracking-tight text-accent no-underline hover:text-accent-hover"
        >
          {SITE.wordmark}
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {showSearch ? (
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search people, skills, or keywords</span>
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search people, skills, or keywords"
                className="w-full rounded-xl border border-line bg-card px-3 py-2 text-sm text-ink outline-none placeholder:text-mute focus:border-accent"
              />
            </label>
          ) : (
            <span className="flex-1" />
          )}
          <button type="button" onClick={onCta} className="btn-accent shrink-0">
            {SITE.cta}
          </button>
        </div>
      </div>
    </header>
  );
}
