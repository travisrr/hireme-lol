import { SITE } from "../lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-mute">
        <p className="max-w-2xl">
          {SITE.name} is a professional leaderboard. Higher bid = higher rank.
          Money talks. Money does not certify talent. Get outbid, you fall down
          — you are not deleted.
        </p>
        <p className="mt-4 font-mono text-[11px]">{SITE.origin}</p>
      </div>
    </footer>
  );
}
