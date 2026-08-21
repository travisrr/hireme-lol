import { DEFAULT_ECONOMICS, type BidEconomics } from "./types";

export function parseEconomics(
  rows: Readonly<Record<string, string | number | null | undefined>>,
  fallback: BidEconomics = DEFAULT_ECONOMICS,
): BidEconomics {
  return {
    minEntryCents: positiveInt(rows.min_entry_cents, fallback.minEntryCents),
    minIncrementCents: positiveInt(
      rows.min_increment_cents,
      fallback.minIncrementCents,
    ),
  };
}

function positiveInt(
  value: string | number | null | undefined,
  fallback: number,
): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
