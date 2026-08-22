import { Link } from "react-router-dom";
import { CONTACT_EMAIL } from "../lib/legal";
import { PAGE_COLUMN } from "../lib/measure";
import { SITE } from "../lib/site";

export function SiteFooter({ inColumn = false }: { inColumn?: boolean }) {
  const frame = inColumn ? "" : `page-gutter mx-auto ${PAGE_COLUMN}`;
  return (
    <footer className={`site-footer ${frame}`.trim()}>
      <div className="site-footer-bar">
        <div className="site-footer-brand">
          <Link
            to="/"
            aria-label={SITE.name}
            className="type-wordmark site-wordmark text-accent no-underline hover:text-accent-hover"
          >
            {SITE.wordmark}
          </Link>
          <p className="type-body text-mute">{SITE.footer}</p>
        </div>
        <div className="site-footer-meta">
          <a href={`mailto:${CONTACT_EMAIL}`} className="site-footer-mail">
            {CONTACT_EMAIL}
          </a>
          <p className="type-meta text-mute">
            <Link
              to="/how-it-works"
              className="text-mute no-underline hover:text-ink hover:underline"
            >
              How it works
            </Link>
            <span aria-hidden="true"> · </span>
            <Link
              to="/privacy"
              className="text-mute no-underline hover:text-ink hover:underline"
            >
              Privacy
            </Link>
            <span aria-hidden="true"> · </span>
            <Link
              to="/terms"
              className="text-mute no-underline hover:text-ink hover:underline"
            >
              Terms
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
