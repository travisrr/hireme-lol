export const LINKEDIN_PULL_EMPTY =
  "We couldn’t read that profile. Check the URL or fill the fields.";

export const PAYMENTS_NOT_READY =
  "Payments aren’t ready yet. Try again in a bit.";

export const BELOW_ENTRY =
  "Enter a bid of at least $2 to get on the board.";

const HUMAN_BY_CODE: Record<string, string> = {
  below_entry: BELOW_ENTRY,
  webhook_secret_required: PAYMENTS_NOT_READY,
  payments_not_ready: PAYMENTS_NOT_READY,
  stripe_not_configured: PAYMENTS_NOT_READY,
  profile_required: "Sign in and add your profile before you bid.",
  unauthorized: "Sign in to continue.",
  invalid_email: "Enter a valid email.",
  magic_failed: "We couldn’t send that link. Try again.",
  bid_failed: PAYMENTS_NOT_READY,
  profile_failed: "We couldn’t save that profile. Check the fields.",
};

export function publicErrorMessage(code: string | undefined): string {
  if (!code) return "Something went wrong. Try again.";
  const mapped = HUMAN_BY_CODE[code];
  if (mapped) return mapped;
  if (code.includes(" ")) return code;
  return "Something went wrong. Try again.";
}
