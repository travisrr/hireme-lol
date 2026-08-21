import { Link } from "react-router-dom";
import { PAGE_COLUMN } from "../lib/measure";
import { SITE } from "../lib/site";

export function SiteFooter({ inColumn = false }: { inColumn?: boolean }) {
  const frame = inColumn ? "" : `page-gutter mx-auto ${PAGE_COLUMN}`;
  return (
    <footer className={`${frame} py-4 text-center`.trim()}>
      <p className="type-body text-mute">{SITE.footer}</p>
      <p className="type-meta mt-2 text-mute">
        <Link to="/privacy" className="text-mute no-underline hover:text-ink">
          Privacy
        </Link>
        <span aria-hidden="true"> · </span>
        <Link to="/terms" className="text-mute no-underline hover:text-ink">
          Terms
        </Link>
      </p>
    </footer>
  );
}
