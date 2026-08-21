import { applyConfirmedPayment, type BoardSnapshot } from "../lib/apply-bid";
import { listingsThatFell } from "../lib/outbid";
import { assertNever, movementFor, rankListings } from "../lib/ranking";
import { DEFAULT_ECONOMICS, type BidEconomics } from "../lib/types";
import type {
  ActivityRow,
  ApplyPaymentInput,
  BidRow,
  CreatePendingBidInput,
  ListingRow,
  NotificationRow,
  ProfileInput,
  ProfileRow,
  PublicBoardRow,
  RankedBoardRow,
  SessionRow,
  Store,
  UserRow,
} from "./store";

type MagicLink = {
  email: string;
  tokenHash: string;
  expiresAt: number;
  consumedAt: number | null;
};

type Session = {
  userId: string;
  expiresAt: number;
};

type EventRow = {
  id: string;
  type: ActivityRow["type"];
  actorProfileId: string | null;
  targetProfileId: string | null;
  amountCents: number | null;
  rankAfter: number | null;
  createdAt: number;
};

export class MemoryStore implements Store {
  users = new Map<string, UserRow>();
  usersByEmail = new Map<string, string>();
  profiles = new Map<string, ProfileRow>();
  profilesByUser = new Map<string, string>();
  profilesByHandle = new Map<string, string>();
  listings = new Map<string, ListingRow>();
  listingsByProfile = new Map<string, string>();
  bids = new Map<string, BidRow>();
  bidsByCheckout = new Map<string, string>();
  bidsByPaymentIntent = new Map<string, string>();
  processedEvents = new Set<string>();
  magicLinks: MagicLink[] = [];
  sessions = new Map<string, Session>();
  events: EventRow[] = [];
  notifications: NotificationRow[] = [];
  unsubscribes = new Map<string, string>();
  nextId = 1;
  economics: BidEconomics = { ...DEFAULT_ECONOMICS };

  async getEconomics(): Promise<BidEconomics> {
    return this.economics;
  }

  private id(prefix: string): string {
    const value = `${prefix}_${this.nextId}`;
    this.nextId += 1;
    return value;
  }

  async getBoard(query?: string): Promise<RankedBoardRow[]> {
    const ranked = this.rankedActive();
    const q = query?.trim().toLowerCase();
    if (!q) return ranked;
    return ranked.filter((row) => {
      const hay = [
        row.displayName,
        row.handle,
        row.headline,
        row.company ?? "",
        row.pitch,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  async getActivity(limit: number): Promise<ActivityRow[]> {
    return [...this.events]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
      .map((event) => {
        const profileId = event.actorProfileId ?? event.targetProfileId;
        const profile = profileId ? this.profiles.get(profileId) : undefined;
        return {
          id: event.id,
          type: event.type,
          handle: profile?.handle ?? null,
          displayName: profile?.displayName ?? null,
          amountCents: event.amountCents,
          rankAfter: event.rankAfter,
          createdAt: event.createdAt,
        };
      });
  }

  async getProfileByHandle(handle: string) {
    const id = this.profilesByHandle.get(handle.toLowerCase());
    if (!id) return null;
    const profile = this.profiles.get(id);
    if (!profile) return null;
    const listingId = this.listingsByProfile.get(profile.id);
    const listing = listingId ? this.listings.get(listingId) ?? null : null;
    const ranked =
      listing && listing.status === "active"
        ? (this.rankedActive().find((row) => row.listingId === listing.id) ??
          null)
        : null;
    return { profile, listing, ranked };
  }

  async upsertUserByEmail(email: string, now: number): Promise<UserRow> {
    const existingId = this.usersByEmail.get(email);
    if (existingId) {
      const user = this.users.get(existingId);
      if (user) return user;
    }
    const user: UserRow = { id: this.id("usr"), email, createdAt: now };
    this.users.set(user.id, user);
    this.usersByEmail.set(email, user.id);
    return user;
  }

  async createMagicLink(
    email: string,
    tokenHash: string,
    expiresAt: number,
    now: number,
  ): Promise<void> {
    void now;
    this.magicLinks.push({
      email,
      tokenHash,
      expiresAt,
      consumedAt: null,
    });
  }

  async consumeMagicLink(tokenHash: string, now: number): Promise<string | null> {
    const link = this.magicLinks.find(
      (row) =>
        row.tokenHash === tokenHash &&
        row.consumedAt === null &&
        row.expiresAt > now,
    );
    if (!link) return null;
    link.consumedAt = now;
    return link.email;
  }

  async createSession(
    id: string,
    userId: string,
    expiresAt: number,
    now: number,
  ): Promise<void> {
    void now;
    this.sessions.set(id, { userId, expiresAt });
  }

  async getSession(
    id: string,
    now: number,
    adminEmails: string[],
  ): Promise<SessionRow | null> {
    const session = this.sessions.get(id);
    if (!session || session.expiresAt <= now) return null;
    const user = this.users.get(session.userId);
    if (!user) return null;
    const profileId = this.profilesByUser.get(user.id);
    return {
      user,
      profile: profileId ? this.profiles.get(profileId) ?? null : null,
      isAdmin: adminEmails.includes(user.email),
    };
  }

  async deleteSession(id: string): Promise<void> {
    this.sessions.delete(id);
  }

  async createProfile(
    userId: string,
    input: ProfileInput,
    now: number,
  ): Promise<ProfileRow> {
    if (this.profilesByUser.has(userId)) {
      throw new Error("profile_exists");
    }
    if (this.profilesByHandle.has(input.handle)) {
      throw new Error("handle_taken");
    }
    const profile: ProfileRow = {
      id: this.id("prf"),
      userId,
      handle: input.handle,
      displayName: input.displayName,
      headline: input.headline,
      company: input.company,
      pitch: input.pitch,
      photoUrl: input.photoUrl,
      linkedinUrl: input.linkedinUrl,
      websiteUrl: input.websiteUrl,
      linkedinClicks: 0,
      websiteClicks: 0,
      profileClicks: 0,
      isFoundingMember: false,
      createdAt: now,
    };
    this.profiles.set(profile.id, profile);
    this.profilesByUser.set(userId, profile.id);
    this.profilesByHandle.set(profile.handle, profile.id);
    return profile;
  }

  async updateProfile(
    userId: string,
    input: ProfileInput,
    now: number,
  ): Promise<ProfileRow> {
    void now;
    const id = this.profilesByUser.get(userId);
    if (!id) throw new Error("profile_missing");
    const current = this.profiles.get(id);
    if (!current) throw new Error("profile_missing");
    if (
      input.handle !== current.handle &&
      this.profilesByHandle.has(input.handle)
    ) {
      throw new Error("handle_taken");
    }
    this.profilesByHandle.delete(current.handle);
    const next: ProfileRow = { ...current, ...input };
    this.profiles.set(id, next);
    this.profilesByHandle.set(next.handle, id);
    return next;
  }

  async getProfileByLinkedinUrl(url: string): Promise<ProfileRow | null> {
    for (const profile of this.profiles.values()) {
      if (profile.linkedinUrl === url) return profile;
    }
    return null;
  }

  async setProfilePhoto(profileId: string, photoKey: string | null): Promise<void> {
    const profile = this.profiles.get(profileId);
    if (!profile) return;
    this.profiles.set(profileId, { ...profile, photoUrl: photoKey });
  }

  async incrementClick(
    listingId: string,
    target: "profile" | "linkedin" | "site",
  ): Promise<{
    profileClicks: number;
    linkedinClicks: number;
    websiteClicks: number;
  } | null> {
    const listing = this.listings.get(listingId);
    if (!listing) return null;
    const profile = this.profiles.get(listing.profileId);
    if (!profile) return null;
    switch (target) {
      case "profile":
        profile.profileClicks += 1;
        break;
      case "linkedin":
        profile.linkedinClicks += 1;
        break;
      case "site":
        profile.websiteClicks += 1;
        break;
      default: {
        const _never: never = target;
        return _never;
      }
    }
    this.profiles.set(profile.id, profile);
    return {
      profileClicks: profile.profileClicks,
      linkedinClicks: profile.linkedinClicks,
      websiteClicks: profile.websiteClicks,
    };
  }

  async listFoundingProfiles(): Promise<ProfileRow[]> {
    return [...this.profiles.values()].filter((profile) => profile.isFoundingMember);
  }

  async createPendingBid(
    input: CreatePendingBidInput,
    now: number,
  ): Promise<BidRow> {
    const profile = this.profiles.get(input.profileId);
    if (!profile) throw new Error("profile_missing");
    let listingId = this.listingsByProfile.get(profile.id);
    if (!listingId) {
      listingId = this.id("lst");
      const listing: ListingRow = {
        id: listingId,
        profileId: profile.id,
        currentBidCents: 0,
        currentBidAt: now,
        currentBidId: null,
        previousRank: null,
        status: "active",
        createdAt: now,
      };
      this.listings.set(listingId, listing);
      this.listingsByProfile.set(profile.id, listingId);
    }
    const bid: BidRow = {
      id: this.id("bid"),
      listingId,
      profileId: profile.id,
      amountCents: input.amountCents,
      status: "pending",
      stripeCheckoutSessionId: input.checkoutSessionId,
      stripePaymentIntentId: null,
    };
    this.bids.set(bid.id, bid);
    if (input.checkoutSessionId) {
      this.bidsByCheckout.set(input.checkoutSessionId, bid.id);
    }
    return bid;
  }

  async attachCheckoutSession(
    bidId: string,
    checkoutSessionId: string,
  ): Promise<void> {
    const bid = this.bids.get(bidId);
    if (!bid) throw new Error("bid_missing");
    bid.stripeCheckoutSessionId = checkoutSessionId;
    this.bids.set(bidId, bid);
    this.bidsByCheckout.set(checkoutSessionId, bidId);
  }

  async applyPayment(input: ApplyPaymentInput) {
    if (this.processedEvents.has(input.eventId)) {
      return { outcome: "idempotent" as const };
    }
    switch (input.action) {
      case "refund":
        return this.revertPayment(input);
      case "complete":
        break;
      default:
        return assertNever(input.action);
    }
    const bid = this.resolveBid(input);
    if (!bid) {
      this.processedEvents.add(input.eventId);
      return { outcome: "refund" as const, reason: "unknown_bid" as const };
    }
    const listing = this.listings.get(bid.listingId);
    const snapshot = this.snapshotForApply(bid, listing);
    const before = this.rankSnapshots();
    const applied = applyConfirmedPayment(
      snapshot,
      {
        eventId: input.eventId,
        bidId: bid.id,
        listingId: bid.listingId,
        amountCents: input.amountCents ?? bid.amountCents,
        paidAt: input.paidAt,
      },
      await this.getEconomics(),
    );
    this.processedEvents.add(input.eventId);
    if (applied.result.outcome === "refund") {
      bid.status = "refunded";
      this.bids.set(bid.id, bid);
      this.events.push({
        id: this.id("evt"),
        type: "refunded",
        actorProfileId: bid.profileId,
        targetProfileId: bid.profileId,
        amountCents: bid.amountCents,
        rankAfter: null,
        createdAt: input.paidAt,
      });
      return applied.result;
    }
    if (applied.result.outcome !== "confirmed") {
      return applied.result;
    }
    const next = applied.board.listings[bid.listingId];
    const firstTime = !listing?.currentBidId;
    const existing = this.listings.get(bid.listingId);
    const listingRow: ListingRow = {
      id: bid.listingId,
      profileId: bid.profileId,
      currentBidCents: next.currentBidCents,
      currentBidAt: next.currentBidAt,
      currentBidId: bid.id,
      previousRank: existing?.previousRank ?? null,
      status: existing?.status ?? "active",
      createdAt: existing?.createdAt ?? input.paidAt,
    };
    this.listings.set(listingRow.id, listingRow);
    this.listingsByProfile.set(bid.profileId, listingRow.id);
    bid.status = "confirmed";
    bid.stripePaymentIntentId =
      input.paymentIntentId ?? bid.stripePaymentIntentId;
    if (bid.stripePaymentIntentId) {
      this.bidsByPaymentIntent.set(bid.stripePaymentIntentId, bid.id);
    }
    this.bids.set(bid.id, bid);
    const confirmedCount = [...this.listings.values()].filter(
      (row) => row.currentBidId && row.status === "active",
    ).length;
    const profile = this.profiles.get(bid.profileId);
    if (profile && confirmedCount <= 100) {
      profile.isFoundingMember = true;
      this.profiles.set(profile.id, profile);
    }
    const after = this.rankSnapshots();
    const actorRank = after.find((row) => row.listingId === bid.listingId);
    this.events.push({
      id: this.id("evt"),
      type: firstTime ? "joined" : "bid_confirmed",
      actorProfileId: bid.profileId,
      targetProfileId: bid.profileId,
      amountCents: next.currentBidCents,
      rankAfter: actorRank?.rank ?? null,
      createdAt: input.paidAt,
    });
    for (const fallen of listingsThatFell(before, after, bid.listingId)) {
      const eventId = this.id("evt");
      this.events.push({
        id: eventId,
        type: "outbid",
        actorProfileId: bid.profileId,
        targetProfileId: fallen.profileId,
        amountCents: next.currentBidCents,
        rankAfter: fallen.rank,
        createdAt: input.paidAt,
      });
      const fallenProfile = this.profiles.get(fallen.profileId);
      const user = fallenProfile
        ? this.users.get(fallenProfile.userId)
        : undefined;
      if (user && fallenProfile && !this.unsubscribes.has(user.email)) {
        this.notifications.push({
          id: this.id("ntf"),
          eventId,
          userId: user.id,
          email: user.email,
          status: "pending",
        });
      }
    }
    this.writePreviousRanks(before);
    return applied.result;
  }

  async hideListing(
    listingId: string,
    hidden: boolean,
    now: number,
  ): Promise<void> {
    const listing = this.listings.get(listingId);
    if (!listing) throw new Error("listing_missing");
    listing.status = hidden ? "hidden" : "active";
    this.listings.set(listingId, listing);
    this.events.push({
      id: this.id("evt"),
      type: hidden ? "listing_hidden" : "listing_unhidden",
      actorProfileId: null,
      targetProfileId: listing.profileId,
      amountCents: null,
      rankAfter: null,
      createdAt: now,
    });
  }

  async setFounding(profileId: string, value: boolean): Promise<void> {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error("profile_missing");
    profile.isFoundingMember = value;
    this.profiles.set(profileId, profile);
  }

  async unsubscribe(email: string, token: string, now: number): Promise<void> {
    void now;
    this.unsubscribes.set(email, token);
  }

  async takePendingNotifications(limit: number): Promise<NotificationRow[]> {
    return this.notifications
      .filter((row) => row.status === "pending")
      .slice(0, limit);
  }

  async markNotification(
    id: string,
    status: "sent" | "failed" | "skipped_unsubscribed",
    now: number,
  ): Promise<void> {
    void now;
    const row = this.notifications.find((item) => item.id === id);
    if (row) row.status = status;
  }

  async adminOverview() {
    return {
      users: this.users.size,
      profiles: this.profiles.size,
      liveListings: [...this.listings.values()].filter(
        (row) => row.status === "active" && row.currentBidId,
      ).length,
      pendingBids: [...this.bids.values()].filter(
        (row) => row.status === "pending",
      ).length,
    };
  }

  private revertPayment(input: ApplyPaymentInput) {
    const bid = this.resolveBid(input);
    this.processedEvents.add(input.eventId);
    if (!bid) {
      return { outcome: "refund" as const, reason: "unknown_bid" as const };
    }
    bid.status = "refunded";
    this.bids.set(bid.id, bid);
    const listing = this.listings.get(bid.listingId);
    if (listing && listing.currentBidId === bid.id) {
      const previous = [...this.bids.values()]
        .filter(
          (row) =>
            row.listingId === bid.listingId &&
            row.status === "confirmed" &&
            row.id !== bid.id,
        )
        .sort((a, b) => b.amountCents - a.amountCents)[0];
      if (previous) {
        listing.currentBidCents = previous.amountCents;
        listing.currentBidId = previous.id;
      } else {
        listing.currentBidCents = 0;
        listing.currentBidId = null;
      }
      this.listings.set(listing.id, listing);
    }
    this.events.push({
      id: this.id("evt"),
      type: "refunded",
      actorProfileId: bid.profileId,
      targetProfileId: bid.profileId,
      amountCents: bid.amountCents,
      rankAfter: null,
      createdAt: input.paidAt,
    });
    return { outcome: "reverted" as const, listingId: bid.listingId };
  }

  private resolveBid(input: ApplyPaymentInput): BidRow | undefined {
    if (input.bidId) return this.bids.get(input.bidId);
    if (input.checkoutSessionId) {
      const id = this.bidsByCheckout.get(input.checkoutSessionId);
      if (id) return this.bids.get(id);
    }
    if (input.paymentIntentId) {
      const id = this.bidsByPaymentIntent.get(input.paymentIntentId);
      return id ? this.bids.get(id) : undefined;
    }
    return undefined;
  }

  private snapshotForApply(
    bid: BidRow,
    listing: ListingRow | undefined,
  ): BoardSnapshot {
    return {
      listings: listing?.currentBidId
        ? {
            [listing.id]: {
              id: listing.id,
              currentBidCents: listing.currentBidCents,
              currentBidAt: listing.currentBidAt,
              currentBidId: listing.currentBidId,
            },
          }
        : {},
      bids: {
        [bid.id]: {
          id: bid.id,
          listingId: bid.listingId,
          amountCents: bid.amountCents,
          status: bid.status,
        },
      },
      processedEventIds: [...this.processedEvents],
    };
  }

  private publicRows(): PublicBoardRow[] {
    const rows: PublicBoardRow[] = [];
    for (const listing of this.listings.values()) {
      if (listing.status !== "active" || !listing.currentBidId) continue;
      const profile = this.profiles.get(listing.profileId);
      if (!profile) continue;
      rows.push({
        listingId: listing.id,
        profileId: profile.id,
        handle: profile.handle,
        displayName: profile.displayName,
        headline: profile.headline,
        company: profile.company,
        pitch: profile.pitch,
        photoUrl: profile.photoUrl,
        linkedinUrl: profile.linkedinUrl,
        websiteUrl: profile.websiteUrl,
        linkedinClicks: profile.linkedinClicks,
        websiteClicks: profile.websiteClicks,
        profileClicks: profile.profileClicks,
        isFoundingMember: profile.isFoundingMember,
        currentBidCents: listing.currentBidCents,
        currentBidAt: listing.currentBidAt,
        profileCreatedAt: profile.createdAt,
        previousRank: listing.previousRank,
      });
    }
    return rows;
  }

  private rankedActive(): RankedBoardRow[] {
    return rankListings(
      this.publicRows().map((row) => ({
        ...row,
        id: row.listingId,
      })),
    ).map((row) => ({
      ...row,
      movement: movementFor(row.rank, row.previousRank),
    }));
  }

  private rankSnapshots() {
    return this.rankedActive().map((row) => ({
      listingId: row.listingId,
      profileId: row.profileId,
      rank: row.rank,
    }));
  }

  private writePreviousRanks(
    before: { listingId: string; rank: number }[],
  ): void {
    const prior = new Map(before.map((row) => [row.listingId, row.rank]));
    for (const listing of this.listings.values()) {
      listing.previousRank = prior.get(listing.id) ?? listing.previousRank;
      this.listings.set(listing.id, listing);
    }
  }
}
