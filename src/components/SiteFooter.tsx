import { PAGE_COLUMN } from "../lib/measure";
import { SITE } from "../lib/site";

export function SiteFooter({ inColumn = false }: { inColumn?: boolean }) {
  return (
    <footer>
      <p
        className={`${inColumn ? "" : `page-gutter mx-auto ${PAGE_COLUMN}`} type-body py-4 text-center text-mute`.trim()}
      >
        {SITE.footer}
      </p>
    </footer>
  );
}
