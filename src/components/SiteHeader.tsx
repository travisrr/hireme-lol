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
          className="type-wordmark site-wordmark text-accent no-underline hover:text-accent-hover"
        >
          {SITE.wordmark}
        </Link>
        <div className="site-header-actions">
          <Link to="/privacy" className="header-legal">
            Privacy
          </Link>
          <Link to="/terms" className="header-legal">
            Terms
          </Link>
          <span className="header-cta">
            <Link to="/join" className="btn-header no-underline">
              {SITE.cta}
            </Link>
          </span>
        </div>
      </div>
      {showSearch ? (
        <div className={`${frame} site-header-search`.trim()}>
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
