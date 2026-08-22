import { SITE } from "./site";
import {
  SHARE_CENTS_PER_VISIT,
  SHARE_MAX_POINTS,
  SHARE_WINDOW_DAYS,
} from "./share-rank";
import { formatUsdFromCents } from "./money";

export const SETTINGS_PATH = "/settings";
export const SETTINGS_NAV = "Edit listing";
export const SETTINGS_TITLE = "Settings";
export const SETTINGS_DOCUMENT_TITLE = `${SETTINGS_TITLE} — ${SITE.name}`;

export const SETTINGS_LEAD =
  "Update the site people click through to, and the bio on your public page.";

export const SETTINGS_BIO_HINT =
  "Paste from LinkedIn, a résumé, or anywhere. Plain text. This shows on your public page, not the board row.";

export const SETTINGS_JUICE_TITLE = "Juice your listing";

export const SETTINGS_JUICE_LEAD = `Share your page. Unique people who open that link in the last ${SHARE_WINDOW_DAYS} days can lift your rank — same cap for every bidder.`;

export function settingsJuiceRules(incrementCents: number): string {
  const cap = formatUsdFromCents(Math.max(0, incrementCents - 1));
  const step = formatUsdFromCents(incrementCents);
  const per = formatUsdFromCents(SHARE_CENTS_PER_VISIT);
  return `Each unique open is worth ${per}, up to ${SHARE_MAX_POINTS} this week (${cap}). A paid ${step} overtake still wins. Your own clicks and link previews do not count. Juice fades after ${SHARE_WINDOW_DAYS} days.`;
}

export const SETTINGS_SIGN_IN = "Sign in with LinkedIn to edit your listing.";
export const SETTINGS_NEED_PROFILE = "Get on the board first, then come back to edit.";
export const SETTINGS_SAVED = "Saved.";
export const SETTINGS_OFF_BOARD =
  "Share juice starts after your first bid lands on the board.";
