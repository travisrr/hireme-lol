import { Link } from "react-router-dom";
import { PAGE_COLUMN } from "../lib/measure";
import { SITE } from "../lib/site";

type SiteHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  showSearch?: boolean;
};

export function SiteHeader({
  query,
  onQueryChange,
  showSearch = true,
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className={`page-gutter site-header-bar mx-auto ${PAGE_COLUMN}`}>
        <Link
          to="/"
          aria-label={SITE.name}
          className="type-wordmark shrink-0 text-accent no-underline hover:text-accent-hover"
        >
          {SITE.wordmark}
        </Link>
        <Link to="/join" className="btn-accent shrink-0 no-underline">
          {SITE.cta}
        </Link>
      </div>
      {showSearch ? (
        <div className={`page-gutter mx-auto ${PAGE_COLUMN} pb-2`}>
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
