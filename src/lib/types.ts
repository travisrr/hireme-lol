import type { IndustryId } from "./industries";

export const GLOBAL_BOARD_ID = "global" as const;

export type BoardId = typeof GLOBAL_BOARD_ID | (string & {});

export type BidStatus = "pending" | "confirmed" | "refunded" | "rejected";

export type EventType =
  | "joined"
  | "bid_confirmed"
  | "outbid"
  | "refunded"
  | "listing_hidden"
  | "listing_unhidden";

export type ListingForRank = {
  id: string;
  currentBidCents: number;
  currentBidAt: number;
  profileCreatedAt: number;
  /** Capped unique-share credit. Never enough to beat a full paid overtake. */
  shareCreditCents?: number;
};

export type Ranked<T extends ListingForRank> = T & { rank: number };

export type Movement = "up" | "down" | "same" | "new";

export type PublicListing = ListingForRank & {
  handle: string;
  displayName: string;
  headline: string;
  company: string | null;
  pitch: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  bio?: string;
  linkedinClicks: number;
  websiteClicks: number;
  profileClicks: number;
  isFoundingMember: boolean;
  previousRank: number | null;
  boardId: BoardId;
  industry: IndustryId | null;
  categories: IndustryId[];
};

export type RankedPublicListing = Ranked<PublicListing> & {
  movement: Movement;
};

export type BoardActivity = {
  id: string;
  type: EventType;
  handle: string;
  displayName: string;
  amountCents: number | null;
  rankAfter: number | null;
  createdAt: number;
  mock?: boolean;
};

export type BidEconomics = {
  minEntryCents: number;
  minIncrementCents: number;
};

/** Launch defaults. Live values come from site_config / /api/config.
 *  Hard lock: $2 to enter, +$2 to overtake. Do not revert to 500/100. */
export const DEFAULT_ECONOMICS: BidEconomics = {
  minEntryCents: 200,
  minIncrementCents: 200,
};

export const LAUNCH_ECONOMICS = DEFAULT_ECONOMICS;

export const PUBLIC_ORIGIN = "https://workwithme.lol";
