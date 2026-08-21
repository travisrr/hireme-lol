import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminOverview, fetchMe, hideListing } from "../api/client";
import { SiteFooter } from "../components/SiteFooter";

export function AdminPage() {
  const [forbidden, setForbidden] = useState(false);
  const [overview, setOverview] = useState<{
    users: number;
    profiles: number;
    liveListings: number;
    pendingBids: number;
  } | null>(null);
  const [listingId, setListingId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchMe()
      .then((me) => {
        if (!me.isAdmin) {
          setForbidden(true);
          return;
        }
        return fetchAdminOverview().then(setOverview);
      })
      .catch(() => setForbidden(true));
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-xl px-4 py-16">
        <p className="text-xs font-semibold text-mute uppercase">/admin</p>
        <h1 className="mt-3 text-4xl font-extrabold">Board admin</h1>
        {forbidden || !overview ? (
          <p className="mt-4 text-mute">
            Sign in with an ADMIN_EMAILS address. Nothing here invents bids.
          </p>
        ) : (
          <div className="mt-6 grid gap-3 text-sm">
            <p>Users {overview.users}</p>
            <p>Profiles {overview.profiles}</p>
            <p>Live listings {overview.liveListings}</p>
            <p>Pending bids {overview.pendingBids}</p>
            <label className="mt-4 grid gap-1">
              <span className="text-[11px] text-mute uppercase">
                Hide listing id
              </span>
              <input
                value={listingId}
                onChange={(event) => setListingId(event.target.value)}
                className="rounded-xl border border-line bg-card px-3 py-2 text-ink"
              />
            </label>
            <button
              type="button"
              className="btn-accent w-fit"
              onClick={() => {
                void hideListing(listingId, true)
                  .then(() => setMessage("Hidden"))
                  .catch((error: unknown) =>
                    setMessage(error instanceof Error ? error.message : "failed"),
                  );
              }}
            >
              Hide
            </button>
            {message ? <p className="text-ink">{message}</p> : null}
          </div>
        )}
        <Link
          to="/"
          className="mt-8 inline-block text-sm"
        >
          ← Board
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
