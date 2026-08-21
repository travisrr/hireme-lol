import { SITE } from "../lib/site";

export function SiteFooter() {
  return (
    <footer>
      <p className="mx-auto max-w-6xl px-4 py-4 text-center text-sm text-mute">
        {SITE.footer}
      </p>
    </footer>
  );
}
