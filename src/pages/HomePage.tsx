import { useCallback, useEffect, useState } from "react";
import { fetchBoard, fetchConfig } from "../api/client";
import { ClaimHeadline } from "../components/ClaimHeadline";
import { JoinDialog } from "../components/JoinDialog";
import { ListingRow } from "../components/ListingRow";
import { ReceiptCard } from "../components/ReceiptCard";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { toPublicListing } from "../lib/board-view";
import { formatUsdFromCents } from "../lib/money";
import { receiptLine } from "../lib/receipts";
import { DEFAULT_ECONOMICS, type BidEconomics } from "../lib/types";
import type { ActivityRow, RankedBoardRow } from "../server/store";

export function HomePage() {
  const [query, setQuery] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const [listings, setListings] = useState<RankedBoardRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [economics, setEconomics] = useState<BidEconomics>(DEFAULT_ECONOMICS);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (nextQuery = query) => {
    try {
      const [data, config] = await Promise.all([
        fetchBoard(nextQuery),
        fetchConfig(),
      ]);
      setListings(data.listings);
      setActivity(data.activity);
      setEconomics({
        minEntryCents: config.minEntryCents,
        minIncrementCents: config.minIncrementCents,
      });
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
  const topThree = rows.slice(0, 3);
  const rest = rows.slice(3);
  const openJoin = () => setJoinOpen(true);

  const trending = rows
    .filter((row) => row.movement === "up" || row.movement === "new")
    .sort((a, b) => b.currentBidAt - a.currentBidAt)
    .slice(0, 5)
    .map((row) => ({
      id: row.id,
      href: `/${row.handle}`,
      line: `${row.displayName} at #${row.rank} · ${formatUsdFromCents(row.currentBidCents)}`,
      at: row.currentBidAt,
    }));

  const receipts = activity.map((item) => ({
    id: item.id,
    href: item.handle ? `/${item.handle}` : undefined,
    line: receiptLine({
      id: item.id,
      type: item.type,
      handle: item.handle ?? "",
      displayName: item.displayName ?? "Someone",
      amountCents: item.amountCents,
      rankAfter: item.rankAfter,
      createdAt: item.createdAt,
    }),
    at: item.createdAt,
  }));

  return (
    <div className="min-h-screen bg-ink">
      <SiteHeader
        query={query}
        onQueryChange={setQuery}
        onCta={openJoin}
      />
      <main className="mx-auto max-w-5xl px-4 pb-12">
        <ClaimHeadline
          board={rows}
          economics={economics}
          onAction={openJoin}
        />
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <ReceiptCard
            title="Trending"
            items={trending}
            empty="No movement yet."
          />
          <ReceiptCard
            title="Latest activity"
            items={receipts}
            empty="No receipts yet."
          />
        </div>
        <section className="mt-8">
          {error ? (
            <p className="border border-down/40 p-4 font-mono text-sm text-down">
              {error}
            </p>
          ) : rows.length === 0 ? (
            <p className="border border-line px-4 py-6 font-mono text-xs text-mute">
              The board is empty. First confirmed bid is #1. Nobody is invented
              to keep you company.
            </p>
          ) : (
            <>
              <div className="grid gap-2">
                {topThree.map((listing) => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    board={rows}
                    economics={economics}
                    featured
                    onOutbid={openJoin}
                  />
                ))}
              </div>
              {rest.length > 0 ? (
                <p className="mt-6 mb-2 font-mono text-[11px] tracking-[0.18em] text-mute uppercase">
                  Top 3
                </p>
              ) : null}
              {rest.map((listing) => (
                <ListingRow
                  key={listing.id}
                  listing={listing}
                  board={rows}
                  economics={economics}
                  onOutbid={openJoin}
                />
              ))}
            </>
          )}
        </section>
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
