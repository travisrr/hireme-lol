import { useCallback, useEffect, useState } from "react";
import { fetchBoard } from "../api/client";
import { ActivityRail } from "../components/ActivityRail";
import { Hero } from "../components/Hero";
import { JoinDialog } from "../components/JoinDialog";
import { ListingRow } from "../components/ListingRow";
import { PreviewBanner } from "../components/PreviewBanner";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { toPublicListing } from "../lib/board-view";
import type { ActivityRow, RankedBoardRow } from "../server/store";

export function HomePage() {
  const [query, setQuery] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const [listings, setListings] = useState<RankedBoardRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (nextQuery = query) => {
    try {
      const data = await fetchBoard(nextQuery);
      setListings(data.listings);
      setActivity(data.activity);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "board_failed");
    }
  }, [query]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void reload(query);
    }, 150);
    return () => window.clearTimeout(handle);
  }, [query, reload]);

  const rows = listings.map(toPublicListing);
  const lead = rows[0];
  const rest = rows.slice(1);

  return (
    <div className="min-h-screen bg-ink">
      <PreviewBanner />
      <SiteHeader
        query={query}
        onQueryChange={setQuery}
        onCta={() => setJoinOpen(true)}
      />
      <Hero onCta={() => setJoinOpen(true)} />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 lg:grid-cols-[1fr_17rem]">
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="font-display text-3xl">The board</h2>
            <p className="font-mono text-[11px] text-mute uppercase">
              Live · global · {rows.length} listed
            </p>
          </div>
          {error ? (
            <p className="border border-down/40 p-6 font-mono text-sm text-down">
              {error}
            </p>
          ) : lead ? (
            <ListingRow
              listing={lead}
              board={rows}
              featured
              onOutbid={() => setJoinOpen(true)}
            />
          ) : (
            <p className="border border-line p-6 text-sm text-mute">
              The board is empty. First confirmed bid is #1. Five dollars.
              Nobody is invented to keep you company.
            </p>
          )}
          <div className="mt-2">
            {rest.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                board={rows}
                onOutbid={() => setJoinOpen(true)}
              />
            ))}
          </div>
        </section>
        <ActivityRail
          items={activity.map((item) => ({
            id: item.id,
            type: item.type,
            handle: item.handle ?? "",
            displayName: item.displayName ?? "Someone",
            amountCents: item.amountCents,
            rankAfter: item.rankAfter,
            createdAt: item.createdAt,
          }))}
        />
      </main>
      <SiteFooter />
      <JoinDialog
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onChanged={() => {
          void reload();
        }}
      />
    </div>
  );
}
