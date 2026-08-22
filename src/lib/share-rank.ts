import {
  facebookShareIntent,
  linkedinShareIntent,
  shareLine,
  threadsShareIntent,
  xShareIntent,
} from "./share";
import { SITE } from "./site";
import { DEFAULT_ECONOMICS } from "./types";

/**
 * Fair share juice: unique people who open a bidder’s share link can nudge
 * rank. Same window, same cap, same cents-per-visit for everyone.
 *
 * Money still buys a full overtake. Max juice is increment − 1¢, so sharing
 * can pass a same-bid listing or close a gap smaller than +$2, and cannot
 * leapfrog someone who paid the overtake amount.
 *
 * Only unique inbound humans count. Owner clicks, empty UAs, and crawlers
 * (LinkedIn/X/Facebook prefetch) do not. Juice fades after 7 days.
 */
export const SHARE_WINDOW_DAYS = 7;
export const SHARE_WINDOW_MS = SHARE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
export const SHARE_CENTS_PER_VISIT = 25;
export const SHARE_MAX_POINTS = 8;
export const SHARE_FROM_PARAM = "from";

export const SHARE_PLATFORMS = [
  "linkedin",
  "x",
  "facebook",
  "threads",
  "copy",
] as const;

export type SharePlatform = (typeof SHARE_PLATFORMS)[number];

export type ShareJuice = {
  uniqueVisits: number;
  countedVisits: number;
  maxPoints: number;
  creditCents: number;
  maxCreditCents: number;
  centsPerVisit: number;
  windowDays: number;
};

export function shareWindowStart(now: number): number {
  return now - SHARE_WINDOW_MS;
}

export function shareMaxCreditCents(
  incrementCents = DEFAULT_ECONOMICS.minIncrementCents,
): number {
  return Math.max(0, incrementCents - 1);
}

export function shareCreditCents(
  uniqueVisits: number,
  incrementCents = DEFAULT_ECONOMICS.minIncrementCents,
): number {
  const visits = Math.max(0, Math.floor(uniqueVisits));
  const points = Math.min(visits, SHARE_MAX_POINTS);
  return Math.min(points * SHARE_CENTS_PER_VISIT, shareMaxCreditCents(incrementCents));
}

export function shareJuice(
  uniqueVisits: number,
  incrementCents = DEFAULT_ECONOMICS.minIncrementCents,
): ShareJuice {
  const visits = Math.max(0, Math.floor(uniqueVisits));
  const maxCreditCents = shareMaxCreditCents(incrementCents);
  return {
    uniqueVisits: visits,
    countedVisits: Math.min(visits, SHARE_MAX_POINTS),
    maxPoints: SHARE_MAX_POINTS,
    creditCents: shareCreditCents(visits, incrementCents),
    maxCreditCents,
    centsPerVisit: SHARE_CENTS_PER_VISIT,
    windowDays: SHARE_WINDOW_DAYS,
  };
}

export function parseSharePlatform(
  raw: string | null | undefined,
): SharePlatform | null {
  const value = (raw ?? "").trim().toLowerCase();
  switch (value) {
    case "linkedin":
      return "linkedin";
    case "x":
    case "twitter":
      return "x";
    case "facebook":
    case "fb":
      return "facebook";
    case "threads":
      return "threads";
    case "copy":
    case "link":
      return "copy";
    case "":
      return null;
    default:
      return null;
  }
}

export function isShareCrawler(userAgent: string): boolean {
  if (!userAgent.trim()) return true;
  return /bot|crawl|spider|slurp|facebookexternalhit|facebot|linkedinbot|twitterbot|whatsapp|telegrambot|discordbot|preview|embedly|quora|pinterest|redditbot|slackbot|vkshare|w3c_validator/i.test(
    userAgent,
  );
}

export function listingShareUrl(
  handle: string,
  platform: SharePlatform,
  origin = SITE.origin,
): string {
  const url = new URL(`/${encodeURIComponent(handle)}`, origin);
  url.searchParams.set(SHARE_FROM_PARAM, platform);
  return url.toString();
}

export function listingShareText(
  rank: number,
  handle: string,
  platform: SharePlatform,
  origin = SITE.origin,
): string {
  return `${shareLine(rank)}\n${listingShareUrl(handle, platform, origin)}`;
}

export function platformShareHref(
  platform: SharePlatform,
  text: string,
  url: string,
): string | null {
  switch (platform) {
    case "linkedin":
      return linkedinShareIntent(text);
    case "x":
      return xShareIntent(text);
    case "facebook":
      return facebookShareIntent(url);
    case "threads":
      return threadsShareIntent(text);
    case "copy":
      return null;
    default: {
      const _never: never = platform;
      return _never;
    }
  }
}
