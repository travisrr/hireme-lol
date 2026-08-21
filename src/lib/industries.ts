export const OVERALL_TAB = "overall" as const;

export const MAX_CATEGORIES = 3;

export const INDUSTRIES = [
  { id: "founders", label: "Founders" },
  { id: "developers", label: "Developers" },
  { id: "designers", label: "Designers" },
  { id: "sales", label: "Sales" },
  { id: "marketing", label: "Marketing" },
  { id: "recruiters", label: "Recruiters" },
  { id: "finance", label: "Finance" },
  { id: "ai", label: "AI" },
  { id: "hospitality", label: "Hospitality" },
  { id: "creators", label: "Creators" },
  { id: "operators", label: "Operators" },
  { id: "consultants", label: "Consultants" },
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

export const CATEGORY_PATHS = INDUSTRIES.map((item) => `/${item.id}`);

const INDUSTRY_IDS = new Set<string>(INDUSTRIES.map((item) => item.id));

export function isIndustryId(value: string): value is IndustryId {
  return INDUSTRY_IDS.has(value);
}

export function parseBoardTab(raw: string | null | undefined): BoardTabId {
  const value = (raw ?? "").trim().toLowerCase();
  if (!value || value === OVERALL_TAB) return OVERALL_TAB;
  return isIndustryId(value) ? value : OVERALL_TAB;
}

export function tabFromPath(
  pathname: string,
  fallback?: string | null,
): BoardTabId {
  const slug = pathname.replace(/^\/+|\/+$/g, "").split("/")[0] ?? "";
  return isIndustryId(slug) ? slug : parseBoardTab(fallback);
}

export function parseIndustry(
  raw: string | null | undefined,
): IndustryId | null {
  const tab = parseBoardTab(raw);
  return tab === OVERALL_TAB ? null : tab;
}

export function parseCategories(raw: unknown): IndustryId[] {
  const parts = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(/[,\s]+/)
      : [];
  const unique: IndustryId[] = [];
  for (const part of parts) {
    const id = parseIndustry(String(part));
    if (id && !unique.includes(id)) unique.push(id);
    if (unique.length >= MAX_CATEGORIES) break;
  }
  return unique;
}

export function serializeCategories(ids: readonly IndustryId[]): string | null {
  return ids.length > 0 ? ids.join(",") : null;
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
  return id === OVERALL_TAB ? "/" : `/${id}`;
}
