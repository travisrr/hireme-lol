import { useMemo, useState } from "react";
import { ActivityRail } from "../components/ActivityRail";
import { Hero } from "../components/Hero";
import { JoinDialog } from "../components/JoinDialog";
import { ListingRow } from "../components/ListingRow";
import { PreviewBanner } from "../components/PreviewBanner";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { filterMockBoard, MOCK_ACTIVITY, MOCK_RANKED } from "../mock/board";

export function HomePage() {
  const [query, setQuery] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const rows = useMemo(() => filterMockBoard(query), [query]);
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
              Mock · {rows.length} of {MOCK_RANKED.length} shown
            </p>
          </div>
          {lead ? (
            <ListingRow
              listing={lead}
              board={MOCK_RANKED}
              featured
              onOutbid={() => setJoinOpen(true)}
            />
          ) : (
            <p className="border border-line p-6 font-mono text-sm text-mute">
              No mock listings match that search.
            </p>
          )}
          <div className="mt-2">
            {rest.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                board={MOCK_RANKED}
                onOutbid={() => setJoinOpen(true)}
              />
            ))}
          </div>
        </section>
        <ActivityRail items={MOCK_ACTIVITY} />
      </main>
      <SiteFooter />
      <JoinDialog open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
