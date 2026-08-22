import { parseCategories, type IndustryId } from "./industries";

export type JoinDraft = {
  linkedinUrl: string;
  displayName: string;
  headline: string;
  photoUrl: string;
  websiteUrl: string;
  categories: IndustryId[];
};

const KEY = "wmw_join_draft";

export function emptyJoinDraft(): JoinDraft {
  return {
    linkedinUrl: "",
    displayName: "",
    headline: "",
    photoUrl: "",
    websiteUrl: "",
    categories: [],
  };
}

export function readJoinDraft(): JoinDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<JoinDraft>;
    return {
      linkedinUrl: String(parsed.linkedinUrl ?? ""),
      displayName: String(parsed.displayName ?? ""),
      headline: String(parsed.headline ?? ""),
      photoUrl: String(parsed.photoUrl ?? ""),
      websiteUrl: String(parsed.websiteUrl ?? ""),
      categories: parseCategories(parsed.categories),
    };
  } catch {
    return null;
  }
}

export function writeJoinDraft(draft: JoinDraft): void {
  sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function clearJoinDraft(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Private mode can throw.
  }
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Private mode can throw.
  }
}
