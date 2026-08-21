export const OVERALL_TAB = "overall" as const;

export const INDUSTRIES = [
  { id: "technology", label: "Technology" },
  { id: "finance", label: "Finance" },
  { id: "healthcare", label: "Healthcare" },
  { id: "real-estate", label: "Real estate" },
  { id: "legal", label: "Legal" },
  { id: "marketing", label: "Marketing" },
  { id: "consulting", label: "Consulting" },
] as const;

export type IndustryId = (typeof INDUSTRIES)[number]["id"];
export type BoardTabId = typeof OVERALL_TAB | IndustryId;

export type BoardTab = {
  id: BoardTabId;
  label: string;
};

export const BOARD_TABS: readonly BoardTab[] = [
  { id: OVERALL_TAB, label: "Overall" },
  ...INDUSTRIES,
];

const INDUSTRY_IDS = new Set<string>(INDUSTRIES.map((item) => item.id));

export function isIndustryId(value: string): value is IndustryId {
  return INDUSTRY_IDS.has(value);
}

export function parseBoardTab(raw: string | null | undefined): BoardTabId {
  const value = (raw ?? "").trim().toLowerCase();
  if (!value || value === OVERALL_TAB) return OVERALL_TAB;
  return isIndustryId(value) ? value : OVERALL_TAB;
}

export function parseIndustry(
  raw: string | null | undefined,
): IndustryId | null {
  const tab = parseBoardTab(raw);
  return tab === OVERALL_TAB ? null : tab;
}

export function industryLabel(id: IndustryId): string {
  const found = INDUSTRIES.find((item) => item.id === id);
  return found?.label ?? id;
}

export function tabLabel(id: BoardTabId): string {
  const found = BOARD_TABS.find((item) => item.id === id);
  return found?.label ?? id;
}

export function emptyIndustryCopy(label: string): string {
  return `No bids in ${label} yet. Be first.`;
}

export function tabHref(id: BoardTabId): string {
  return id === OVERALL_TAB ? "/" : `/?tab=${id}`;
}
