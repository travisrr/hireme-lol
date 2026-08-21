import type { ApplyPaymentResult } from "../lib/apply-bid";
import type { BidEconomics, EventType, Movement } from "../lib/types";

export type UserRow = {
  id: string;
  email: string;
  createdAt: number;
};

export type ProfileRow = {
  id: string;
  userId: string;
  handle: string;
  displayName: string;
  headline: string;
  company: string | null;
  pitch: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  linkedinClicks: number;
  websiteClicks: number;
  isFoundingMember: boolean;
  createdAt: number;
};

export type ListingRow = {
  id: string;
  profileId: string;
  currentBidCents: number;
  currentBidAt: number;
  currentBidId: string | null;
  previousRank: number | null;
  status: "active" | "hidden";
  createdAt: number;
};

export type BidRow = {
  id: string;
  listingId: string;
  profileId: string;
  amountCents: number;
  status: "pending" | "confirmed" | "refunded" | "rejected";
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
};

export type PublicBoardRow = {
  listingId: string;
  profileId: string;
  handle: string;
  displayName: string;
  headline: string;
  company: string | null;
  pitch: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  linkedinClicks: number;
  websiteClicks: number;
  isFoundingMember: boolean;
  currentBidCents: number;
  currentBidAt: number;
  profileCreatedAt: number;
  previousRank: number | null;
};

export type RankedBoardRow = PublicBoardRow & {
  rank: number;
  movement: Movement;
};

export type ActivityRow = {
  id: string;
  type: EventType;
  handle: string | null;
  displayName: string | null;
  amountCents: number | null;
  rankAfter: number | null;
  createdAt: number;
};

export type SessionRow = {
  user: UserRow;
  profile: ProfileRow | null;
  isAdmin: boolean;
};

export type ProfileInput = {
  handle: string;
  displayName: string;
  headline: string;
  company: string | null;
  pitch: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
};

export type CreatePendingBidInput = {
  profileId: string;
  amountCents: number;
  checkoutSessionId: string | null;
};

export type ApplyStripeInput = {
  eventId: string;
  eventType: string;
  bidId?: string;
  checkoutSessionId?: string;
  paymentIntentId?: string | null;
  amountCents?: number;
  paidAt: number;
};

export type NotificationRow = {
  id: string;
  eventId: string;
  userId: string;
  email: string;
  status: "pending" | "sent" | "failed" | "skipped_unsubscribed";
};

export interface Store {
  getEconomics(): Promise<BidEconomics>;
  getBoard(query?: string): Promise<RankedBoardRow[]>;
  getActivity(limit: number): Promise<ActivityRow[]>;
  getProfileByHandle(handle: string): Promise<{
    profile: ProfileRow;
    listing: ListingRow | null;
    ranked: RankedBoardRow | null;
  } | null>;
  upsertUserByEmail(email: string, now: number): Promise<UserRow>;
  createMagicLink(email: string, tokenHash: string, expiresAt: number, now: number): Promise<void>;
  consumeMagicLink(tokenHash: string, now: number): Promise<string | null>;
  createSession(id: string, userId: string, expiresAt: number, now: number): Promise<void>;
  getSession(id: string, now: number, adminEmails: string[]): Promise<SessionRow | null>;
  deleteSession(id: string): Promise<void>;
  createProfile(userId: string, input: ProfileInput, now: number): Promise<ProfileRow>;
  updateProfile(userId: string, input: ProfileInput, now: number): Promise<ProfileRow>;
  getProfileByLinkedinUrl(url: string): Promise<ProfileRow | null>;
  setProfilePhoto(profileId: string, photoKey: string | null): Promise<void>;
  incrementClick(
    listingId: string,
    target: "linkedin" | "site",
  ): Promise<{ linkedinClicks: number; websiteClicks: number } | null>;
  listFoundingProfiles(): Promise<ProfileRow[]>;
  createPendingBid(input: CreatePendingBidInput, now: number): Promise<BidRow>;
  attachCheckoutSession(bidId: string, checkoutSessionId: string): Promise<void>;
  applyStripePayment(input: ApplyStripeInput): Promise<ApplyPaymentResult>;
  hideListing(listingId: string, hidden: boolean, now: number): Promise<void>;
  setFounding(profileId: string, value: boolean): Promise<void>;
  unsubscribe(email: string, token: string, now: number): Promise<void>;
  takePendingNotifications(limit: number): Promise<NotificationRow[]>;
  markNotification(
    id: string,
    status: "sent" | "failed" | "skipped_unsubscribed",
    now: number,
  ): Promise<void>;
  adminOverview(): Promise<{
    users: number;
    profiles: number;
    liveListings: number;
    pendingBids: number;
  }>;
}
