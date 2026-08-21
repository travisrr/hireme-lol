import { Link } from "react-router-dom";
import { PreviewBanner } from "../components/PreviewBanner";
import { SiteFooter } from "../components/SiteFooter";

export function AdminPage() {
  return (
    <div className="min-h-screen bg-ink">
      <PreviewBanner />
      <main className="mx-auto max-w-xl px-4 py-16">
        <p className="font-mono text-[11px] text-money uppercase">
          /admin · not wired
        </p>
        <h1 className="mt-3 font-display text-5xl">Basic admin comes next</h1>
        <p className="mt-4 text-mute">
          Hide a listing, refund a bid, toggle founding badge, edit min entry /
          increment. Gated by ADMIN_EMAILS. Nothing here mutates production
          data — there is no production board yet.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block font-mono text-xs text-money underline"
        >
          ← Mock board
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
