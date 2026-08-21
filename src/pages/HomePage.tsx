import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBoard, fetchConfig } from "../api/client";
import { BoardTabs } from "../components/BoardTabs";
import { ClaimHeadline } from "../components/ClaimHeadline";
import { ListingRow, TOP_TEN_CUTOFF } from "../components/ListingRow";
import { ReceiptCard } from "../components/ReceiptCard";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { toPublicListing } from "../lib/board-view";
import { PAGE_COLUMN } from "../lib/measure";
import { formatUsdFromCents } from "../lib/money";
import { receiptLine } from "../lib/receipts";
import { SITE } from "../lib/site";
import { DEFAULT_ECONOMICS, type BidEconomics } from "../lib/types";
import type { ActivityRow, RankedBoardRow } from "../server/store";

export function HomePage() {
  const [query, setQuery] = useState("");
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
  const topTen = rows.slice(0, TOP_TEN_CUTOFF);
  const rest = rows.slice(TOP_TEN_CUTOFF);

  const trending = rows
    .filter((row) => row.movement === "up" || row.movement === "new")
    .sort((a, b) => b.currentBidAt - a.currentBidAt)
    .slice(0, 5)
    .map((row) => ({
      id: row.id,
      href: `/${row.handle}`,
      line: `${row.displayName}`,
      rank: row.rank,
      amount: `${formatUsdFromCents(row.currentBidCents)}`,
      photoUrl: row.photoUrl,
      at: row.currentBidAt,
    }));

  const receipts = activity.map((item) => ({
    id: item.id,
    href: item.handle ? `/${item.handle}` : undefined,
    photoUrl: item.handle
      ? rows.find((row) => row.handle === item.handle)?.photoUrl ?? null
      : null,
    amount:
      item.amountCents != null ? formatUsdFromCents(item.amountCents) : undefined,
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
    <div className="min-h-screen bg-paper">
      <SiteHeader query={query} onQueryChange={setQuery} />
      <main className={`page-gutter mx-auto ${PAGE_COLUMN} pb-8`}>
        <section
          data-lock="header-hero"
          className="grid items-start gap-4 pt-4 lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.45fr)]"
        >
          <ClaimHeadline board={rows} economics={economics} />
          <div className="grid min-w-0 gap-3 lg:grid-cols-2">
            <ReceiptCard
              title="Trending"
              items={trending}
              empty="No movement yet."
              footerHref="#board"
              footerLabel="View full board →"
            />
            <ReceiptCard
              title="Latest activity"
              items={receipts}
              empty="No receipts yet."
              footerHref="#board"
              footerLabel="View all activity →"
            />
          </div>
        </section>
        <section
          id="board"
          data-lock="board-tabs"
          className="mt-4 overflow-hidden rounded-[12px] border border-line bg-card"
        >
          <BoardTabs />
          {error ? (
            <p className="type-body p-3 text-down">{error}</p>
          ) : rows.length === 0 ? (
            <div className="px-3 py-6">
              <p className="type-body text-mute">
                The board is empty. First confirmed bid is #1.
              </p>
              <Link to="/join" className="btn-accent mt-3 inline-block no-underline">
                {SITE.cta}
              </Link>
            </div>
          ) : (
            <>
              {topTen.map((listing) => (
                <ListingRow
                  key={listing.id}
                  listing={listing}
                  board={rows}
                  economics={economics}
                />
              ))}
              {rest.length > 0 ? (
                <div className="flex items-center gap-3 bg-paper px-3 py-1.5">
                  <span className="h-px flex-1 bg-line" />
                  <p className="text-[10px] font-bold tracking-[0.16em] text-mute uppercase">
                    Top 10
                  </p>
                  <span className="h-px flex-1 bg-line" />
                </div>
              ) : null}
              {rest.map((listing) => (
                <ListingRow
                  key={listing.id}
                  listing={listing}
                  board={rows}
                  economics={economics}
                />
              ))}
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
