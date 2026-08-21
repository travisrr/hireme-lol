import { DEFAULT_ECONOMICS } from "./types";

export function formatUsdFromCents(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const remainder = abs % 100;
  const body =
    remainder === 0
      ? `$${dollars.toLocaleString("en-US")}`
      : `$${dollars.toLocaleString("en-US")}.${remainder.toString().padStart(2, "0")}`;
  return negative ? `-${body}` : body;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function parseDollarInput(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (cleaned === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100);
}

/**
 * Join bids are dollars. `2` / `$2` / `2.00` are $2 (200 cents).
 * `amountCents: 200` stays $2. A bare `2` in a cents field is dollars,
 * never 2 cents — that bug rejected a legal $2 first entry.
 */
export function parseBidAmountCents(
  raw: unknown,
  minEntryCents = DEFAULT_ECONOMICS.minEntryCents,
): number | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "string" && /[$.]/.test(raw)) {
    return parseDollarInput(raw);
  }
  const n =
    typeof raw === "number" ? raw : Number(String(raw).replace(/[,\s]/g, ""));
  if (!Number.isInteger(n) || n <= 0) {
    return typeof raw === "string" ? parseDollarInput(raw) : null;
  }
  if (n >= minEntryCents) return n;
  if (n < 100) return n * 100;
  return n;
}
