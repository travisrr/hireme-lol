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
