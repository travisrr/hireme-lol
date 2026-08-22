export type JoinOauthProfile = {
  displayName?: string | null;
  photoUrl?: string | null;
  headline?: string | null;
  linkedinUrl?: string | null;
} | null | undefined;

export type JoinStep = "signin" | "identity" | "share";

export function isLiveLinkedInProfile(oauth: JoinOauthProfile): boolean {
  if (!oauth || typeof oauth !== "object") return false;
  return String(oauth.displayName ?? "").trim().length > 0;
}

export function joinStepFromServer(input: {
  hasUser: boolean;
  oauthProfile: JoinOauthProfile;
  share?: boolean;
  paid?: boolean;
}): JoinStep {
  if ((input.share || input.paid) && input.hasUser) return "share";
  if (input.hasUser && isLiveLinkedInProfile(input.oauthProfile)) {
    return "identity";
  }
  return "signin";
}
