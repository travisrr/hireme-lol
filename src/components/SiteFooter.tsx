import { SITE } from "../lib/site";

export function SiteFooter() {
  return (
    <footer>
      <p className="page-gutter type-body mx-auto max-w-6xl py-4 text-center text-mute">
        {SITE.footer}
      </p>
    </footer>
  );
}
