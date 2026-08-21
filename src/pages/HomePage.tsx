import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { fetchBoard, fetchConfig } from "../api/client";
import { BoardTabs } from "../components/BoardTabs";
import { ClaimHeadline } from "../components/ClaimHeadline";
import { ListingRow, TOP_TEN_CUTOFF } from "../components/ListingRow";
import { PulseCard } from "../components/PulseCard";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { toPublicListing } from "../lib/board-view";
import {
  emptyIndustryCopy,
  parseIndustry,
  tabFromPath,
  tabLabel,
} from "../lib/industries";
import { PAGE_COLUMN } from "../lib/measure";
import { formatUsdFromCents } from "../lib/money";
import { pulseTrendingLine, seededActivity } from "../lib/pulse-seed";
import { SITE } from "../lib/site";
import { DEFAULT_ECONOMICS, type BidEconomics } from "../lib/types";
import type { RankedBoardRow } from "../server/store";

export function HomePage() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const tab = tabFromPath(pathname, searchParams.get("tab"));
  const industry = parseIndustry(tab);
  const [query, setQuery] = useState("");
  const [listings, setListings] = useState<RankedBoardRow[]>([]);
  const [economics, setEconomics] = useState<BidEconomics>(DEFAULT_ECONOMICS);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (nextQuery = query) => {
    try {
      const [data, config] = await Promise.all([
        fetchBoard(nextQuery, industry),
        fetchConfig(),
      ]);
      setListings(data.listings);
      setEconomics({
        minEntryCents: config.minEntryCents,
        minIncrementCents: config.minIncrementCents,
      });
      setError(null);
    } catch {
      setError("The board failed to load. Refresh and try again.");
    }
  }, [industry, query]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void reload(query);
    }, 150);
    return () => window.clearTimeout(handle);
  }, [query, reload]);

  const rows = listings.map(toPublicListing);
  const topTen = rows.slice(0, TOP_TEN_CUTOFF);
  const rest = rows.slice(TOP_TEN_CUTOFF);

  const hoursByRank: Record<number, string> = {
    1: "2h ago",
    2: "3h ago",
    3: "4h ago",
  };
  const trending = rows.slice(0, 5).map((row) => ({
    id: row.id,
    href: `/${row.handle}`,
    line: pulseTrendingLine(
      row.displayName,
      row.rank,
      formatUsdFromCents(row.currentBidCents),
      hoursByRank[row.rank] ?? "2h ago",
    ),
    photoUrl: row.photoUrl,
    at: row.currentBidAt,
  }));
  const receipts = seededActivity();

  return (
    <div className="min-h-screen bg-paper">
      <div className={`page-gutter mx-auto ${PAGE_COLUMN}`}>
      <SiteHeader query={query} onQueryChange={setQuery} inColumn />
      <main className="pb-8">
        <section data-lock="header-hero" className="hero-lock">
          <ClaimHeadline board={rows} economics={economics} />
          <PulseCard trending={trending} activity={receipts} />
        </section>
        <section
          id="board"
          data-lock="board-tabs"
          className="mt-4 overflow-hidden rounded-[12px] border border-line bg-card"
        >
          <BoardTabs active={tab} />
          {error ? (
            <p className="type-body p-3 text-down">{error}</p>
          ) : rows.length === 0 ? (
            <div className="px-3 py-6">
              <p className="type-body text-mute">
                {industry
                  ? emptyIndustryCopy(tabLabel(tab))
                  : "The board is empty. First confirmed bid is #1."}
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
      <SiteFooter inColumn />
      </div>
    </div>
  );
}
