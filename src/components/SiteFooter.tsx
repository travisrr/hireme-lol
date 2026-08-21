import { SITE } from "../lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <p className="mx-auto max-w-5xl px-4 py-8 text-center font-display text-sm tracking-wide text-mute uppercase">
        {SITE.footer}
      </p>
    </footer>
  );
}
