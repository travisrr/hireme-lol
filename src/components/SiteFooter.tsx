import { PAGE_COLUMN } from "../lib/measure";
import { SITE } from "../lib/site";

export function SiteFooter() {
  return (
    <footer>
      <p className={`page-gutter type-body mx-auto ${PAGE_COLUMN} py-4 text-center text-mute`}>
        {SITE.footer}
      </p>
    </footer>
  );
}
