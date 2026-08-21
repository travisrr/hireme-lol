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
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-1.5">
        <Link
          to="/"
          aria-label={SITE.name}
          className="flex shrink-0 items-baseline no-underline hover:text-ink"
        >
          <span className="font-display text-lg tracking-tight text-ink">
            workwithme
          </span>
          <span className="font-mono text-[11px] text-ink">.lol</span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {showSearch ? (
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search people, skills, or keywords</span>
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search people, skills, or keywords."
                className="w-full border border-line bg-paper px-2.5 py-1.5 font-mono text-xs text-ink outline-none placeholder:text-mute focus:border-ink"
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
