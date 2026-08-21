import { Link } from "react-router-dom";
import { PAGE_COLUMN } from "../lib/measure";
import { SITE } from "../lib/site";

type SiteHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  showSearch?: boolean;
  inColumn?: boolean;
};

export function SiteHeader({
  query,
  onQueryChange,
  showSearch = true,
  inColumn = false,
}: SiteHeaderProps) {
  const frame = inColumn ? "" : `page-gutter mx-auto ${PAGE_COLUMN}`;
  return (
    <header className="site-header">
      <div className={`${frame} site-header-bar`.trim()}>
        <Link
          to="/"
          aria-label={SITE.name}
          className="type-wordmark shrink-0 text-accent no-underline hover:text-accent-hover"
        >
          {SITE.wordmark}
        </Link>
        <Link to="/join" className="btn-header shrink-0 no-underline">
          {SITE.cta}
        </Link>
      </div>
      {showSearch ? (
        <div className={`${frame} pt-1 pb-2`.trim()}>
          <label>
            <span className="sr-only">Search people, skills, or keywords</span>
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search people, skills, or keywords"
              className="search-field"
            />
          </label>
        </div>
      ) : null}
    </header>
  );
}
