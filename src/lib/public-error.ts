export const LINKEDIN_PULL_EMPTY =
  "We couldn’t read that profile. Check the URL or fill the fields.";

export const PAYMENTS_NOT_READY =
  "Payments aren’t ready yet. Try again in a bit.";

export const BELOW_ENTRY =
  "Enter a bid of at least $2 to get on the board.";

export const EMAIL_NOT_CONFIGURED =
  "Sign-in email isn’t ready yet. Try again in a bit.";

const HUMAN_BY_CODE: Record<string, string> = {
  below_entry: BELOW_ENTRY,
  webhook_secret_required: PAYMENTS_NOT_READY,
  payments_not_ready: PAYMENTS_NOT_READY,
  stripe_not_configured: PAYMENTS_NOT_READY,
  email_not_configured: EMAIL_NOT_CONFIGURED,
  profile_required: "Sign in and add your profile before you bid.",
  unauthorized: "Sign in to continue.",
  invalid_email: "Enter a valid email.",
  magic_failed: "We couldn’t send that link. Try again.",
  bid_failed: PAYMENTS_NOT_READY,
  bad_signature: PAYMENTS_NOT_READY,
  profile_failed: "We couldn’t save that profile. Check the fields.",
  invalid_photo: "Use a JPEG, PNG, or WebP photo.",
  media_unbound: "Photo upload isn’t ready yet. Paste a photo URL instead.",
};

export function publicErrorMessage(code: string | undefined): string {
  if (!code) return "Something went wrong. Try again.";
  const mapped = HUMAN_BY_CODE[code];
  if (mapped) return mapped;
  if (code.includes(" ")) return code;
  return "Something went wrong. Try again.";
}
