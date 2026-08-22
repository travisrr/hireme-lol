import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { HOW_IT_WORKS_NAV, HOW_IT_WORKS_PATH } from "../lib/how-it-works";
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
          <HeaderMuteLink to={HOW_IT_WORKS_PATH}>{HOW_IT_WORKS_NAV}</HeaderMuteLink>
          <HeaderMuteLink to="/privacy">Privacy</HeaderMuteLink>
          <HeaderMuteLink to="/terms">Terms</HeaderMuteLink>
          <ThemeToggle />
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

function HeaderMuteLink({
  to,
  children,
}: {
  to: string;
  children: string;
}) {
  const { pathname } = useLocation();
  const current = pathname === to;
  return (
    <Link
      to={to}
      className={current ? "header-legal is-current" : "header-legal"}
      aria-current={current ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
