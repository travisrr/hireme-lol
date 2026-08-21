export type JoinDraft = {
  linkedinUrl: string;
  displayName: string;
  headline: string;
  photoUrl: string;
};

const KEY = "wmw_join_draft";

export function emptyJoinDraft(): JoinDraft {
  return {
    linkedinUrl: "",
    displayName: "",
    headline: "",
    photoUrl: "",
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
    };
  } catch {
    return null;
  }
}

export function writeJoinDraft(draft: JoinDraft): void {
  sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function clearJoinDraft(): void {
  sessionStorage.removeItem(KEY);
}
