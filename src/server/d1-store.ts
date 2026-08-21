import { applyConfirmedPayment } from "../lib/apply-bid";
import { parseEconomics } from "../lib/economics";
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

export type D1Prepared = {
  bind: (...values: unknown[]) => D1Prepared;
  first: <T>() => Promise<T | null>;
  all: <T>() => Promise<{ results: T[] }>;
  run: () => Promise<{ meta?: { changes?: number } }>;
};

export type D1Like = {
  prepare: (sql: string) => D1Prepared;
  batch: (statements: D1Prepared[]) => Promise<unknown>;
};

type ProfileSql = {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  headline: string;
  company: string | null;
  pitch: string;
  photo_r2_key: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  linkedin_clicks: number;
  website_clicks: number;
  profile_clicks: number;
  is_founding_member: number;
  created_at: number;
};

type ListingSql = {
  id: string;
  profile_id: string;
  current_bid_cents: number;
  current_bid_at: number;
  current_bid_id: string | null;
  previous_rank: number | null;
  status: "active" | "hidden";
  created_at: number;
};

type BidSql = {
  id: string;
  listing_id: string;
  profile_id: string;
  amount_cents: number;
  status: BidRow["status"];
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  confirmed_at: number | null;
};

type UserSql = { id: string; email: string; created_at: number };

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function mapProfile(row: ProfileSql): ProfileRow {
  return {
    id: row.id,
    userId: row.user_id,
    handle: row.handle,
    displayName: row.display_name,
    headline: row.headline,
    company: row.company,
    pitch: row.pitch,
    photoUrl: row.photo_r2_key,
    linkedinUrl: row.linkedin_url,
    websiteUrl: row.website_url,
    linkedinClicks: row.linkedin_clicks ?? 0,
    websiteClicks: row.website_clicks ?? 0,
    profileClicks: row.profile_clicks ?? 0,
    isFoundingMember: row.is_founding_member === 1,
    createdAt: row.created_at,
  };
}

function mapListing(row: ListingSql): ListingRow {
  return {
    id: row.id,
    profileId: row.profile_id,
    currentBidCents: row.current_bid_cents,
    currentBidAt: row.current_bid_at,
    currentBidId: row.current_bid_id,
    previousRank: row.previous_rank,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapBid(row: BidSql): BidRow {
  return {
    id: row.id,
    listingId: row.listing_id,
    profileId: row.profile_id,
    amountCents: row.amount_cents,
    status: row.status,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
  };
}

export class D1Store implements Store {
  private readonly db: D1Like;

  constructor(db: D1Like) {
    this.db = db;
  }

  async getEconomics(): Promise<BidEconomics> {
    try {
      const result = await this.db
        .prepare(
          `SELECT key, value FROM site_config
           WHERE key IN ('min_entry_cents', 'min_increment_cents')`,
        )
        .all<{ key: string; value: string }>();
      const rows: Record<string, string> = {};
      for (const row of result.results) {
        rows[row.key] = row.value;
      }
      return parseEconomics(rows);
    } catch {
      return { ...DEFAULT_ECONOMICS };
    }
  }

  async getBoard(query?: string): Promise<RankedBoardRow[]> {
    const ranked = await this.rankedActive();
    const q = query?.trim().toLowerCase();
    if (!q) return ranked;
    return ranked.filter((row) =>
      [row.displayName, row.handle, row.headline, row.company ?? "", row.pitch]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }

  async getActivity(limit: number): Promise<ActivityRow[]> {
    const { results } = await this.db
      .prepare(
        `SELECT e.id, e.type, e.amount_cents, e.rank_after, e.created_at,
                p.handle, p.display_name
         FROM events e
         LEFT JOIN profiles p ON p.id = COALESCE(e.actor_profile_id, e.target_profile_id)
         WHERE e.board_id = 'global'
         ORDER BY e.created_at DESC
         LIMIT ?`,
      )
      .bind(limit)
      .all<{
        id: string;
        type: ActivityRow["type"];
        amount_cents: number | null;
        rank_after: number | null;
        created_at: number;
        handle: string | null;
        display_name: string | null;
      }>();
    return results.map((row) => ({
      id: row.id,
      type: row.type,
      handle: row.handle,
      displayName: row.display_name,
      amountCents: row.amount_cents,
      rankAfter: row.rank_after,
      createdAt: row.created_at,
    }));
  }

  async getProfileByHandle(handle: string) {
    const profileSql = await this.db
      .prepare(`SELECT * FROM profiles WHERE handle = ?`)
      .bind(handle)
      .first<ProfileSql>();
    if (!profileSql) return null;
    const profile = mapProfile(profileSql);
    const listingSql = await this.db
      .prepare(`SELECT * FROM listings WHERE profile_id = ? AND board_id = 'global'`)
      .bind(profile.id)
      .first<ListingSql>();
    const listing = listingSql ? mapListing(listingSql) : null;
    const ranked =
      listing && listing.status === "active" && listing.currentBidId
        ? ((await this.rankedActive()).find((row) => row.listingId === listing.id) ??
          null)
        : null;
    return { profile, listing, ranked };
  }

  async upsertUserByEmail(email: string, now: number): Promise<UserRow> {
    const existing = await this.db
      .prepare(`SELECT * FROM users WHERE email = ?`)
      .bind(email)
      .first<UserSql>();
    if (existing) {
      return { id: existing.id, email: existing.email, createdAt: existing.created_at };
    }
    const user: UserRow = { id: newId("usr"), email, createdAt: now };
    await this.db
      .prepare(`INSERT INTO users (id, email, created_at, last_login_at) VALUES (?, ?, ?, ?)`)
      .bind(user.id, email, now, now)
      .run();
    return user;
  }

  async createMagicLink(
    email: string,
    tokenHash: string,
    expiresAt: number,
    now: number,
  ): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO magic_links (id, email, token_hash, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(newId("ml"), email, tokenHash, expiresAt, now)
      .run();
  }

  async consumeMagicLink(tokenHash: string, now: number): Promise<string | null> {
    const row = await this.db
      .prepare(
        `SELECT id, email FROM magic_links
         WHERE token_hash = ? AND consumed_at IS NULL AND expires_at > ?`,
      )
      .bind(tokenHash, now)
      .first<{ id: string; email: string }>();
    if (!row) return null;
    await this.db
      .prepare(`UPDATE magic_links SET consumed_at = ? WHERE id = ?`)
      .bind(now, row.id)
      .run();
    return row.email;
  }

  async createSession(
    id: string,
    userId: string,
    expiresAt: number,
    now: number,
  ): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`,
      )
      .bind(id, userId, expiresAt, now)
      .run();
  }

  async getSession(
    id: string,
    now: number,
    adminEmails: string[],
  ): Promise<SessionRow | null> {
    const user = await this.db
      .prepare(
        `SELECT u.id, u.email, u.created_at
         FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.id = ? AND s.expires_at > ?`,
      )
      .bind(id, now)
      .first<UserSql>();
    if (!user) return null;
    const profileSql = await this.db
      .prepare(`SELECT * FROM profiles WHERE user_id = ?`)
      .bind(user.id)
      .first<ProfileSql>();
    return {
      user: { id: user.id, email: user.email, createdAt: user.created_at },
      profile: profileSql ? mapProfile(profileSql) : null,
      isAdmin: adminEmails.includes(user.email),
    };
  }

  async deleteSession(id: string): Promise<void> {
    await this.db.prepare(`DELETE FROM sessions WHERE id = ?`).bind(id).run();
  }

  async createProfile(
    userId: string,
    input: ProfileInput,
    now: number,
  ): Promise<ProfileRow> {
    const profile: ProfileRow = {
      id: newId("prf"),
      userId,
      ...input,
      isFoundingMember: false,
      linkedinClicks: 0,
      websiteClicks: 0,
      profileClicks: 0,
      createdAt: now,
    };
    await this.db
      .prepare(
        `INSERT INTO profiles (
          id, user_id, handle, display_name, headline, company, pitch,
          photo_r2_key, linkedin_url, website_url, is_founding_member, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      )
      .bind(
        profile.id,
        userId,
        input.handle,
        input.displayName,
        input.headline,
        input.company,
        input.pitch,
        input.photoUrl,
        input.linkedinUrl,
        input.websiteUrl,
        now,
        now,
      )
      .run();
    return profile;
  }

  async updateProfile(
    userId: string,
    input: ProfileInput,
    now: number,
  ): Promise<ProfileRow> {
    const current = await this.db
      .prepare(`SELECT * FROM profiles WHERE user_id = ?`)
      .bind(userId)
      .first<ProfileSql>();
    if (!current) throw new Error("profile_missing");
    await this.db
      .prepare(
        `UPDATE profiles SET handle = ?, display_name = ?, headline = ?, company = ?,
         pitch = ?, photo_r2_key = ?, linkedin_url = ?, website_url = ?, updated_at = ?
         WHERE user_id = ?`,
      )
      .bind(
        input.handle,
        input.displayName,
        input.headline,
        input.company,
        input.pitch,
        input.photoUrl,
        input.linkedinUrl,
        input.websiteUrl,
        now,
        userId,
      )
      .run();
    return mapProfile({
      ...current,
      handle: input.handle,
      display_name: input.displayName,
      headline: input.headline,
      company: input.company,
      pitch: input.pitch,
      photo_r2_key: input.photoUrl,
      linkedin_url: input.linkedinUrl,
      website_url: input.websiteUrl,
    });
  }

  async getProfileByLinkedinUrl(url: string): Promise<ProfileRow | null> {
    const row = await this.db
      .prepare(`SELECT * FROM profiles WHERE linkedin_url = ?`)
      .bind(url)
      .first<ProfileSql>();
    return row ? mapProfile(row) : null;
  }

  async setProfilePhoto(profileId: string, photoKey: string | null): Promise<void> {
    await this.db
      .prepare(`UPDATE profiles SET photo_r2_key = ? WHERE id = ?`)
      .bind(photoKey, profileId)
      .run();
  }

  async incrementClick(
    listingId: string,
    target: "profile" | "linkedin" | "site",
  ): Promise<{
    profileClicks: number;
    linkedinClicks: number;
    websiteClicks: number;
  } | null> {
    const listing = await this.db
      .prepare(`SELECT profile_id FROM listings WHERE id = ?`)
      .bind(listingId)
      .first<{ profile_id: string }>();
    if (!listing) return null;
    let column: "profile_clicks" | "linkedin_clicks" | "website_clicks";
    switch (target) {
      case "profile":
        column = "profile_clicks";
        break;
      case "linkedin":
        column = "linkedin_clicks";
        break;
      case "site":
        column = "website_clicks";
        break;
      default:
        return assertNever(target);
    }
    await this.db
      .prepare(`UPDATE profiles SET ${column} = ${column} + 1 WHERE id = ?`)
      .bind(listing.profile_id)
      .run();
    const row = await this.db
      .prepare(
        `SELECT profile_clicks, linkedin_clicks, website_clicks FROM profiles WHERE id = ?`,
      )
      .bind(listing.profile_id)
      .first<{
        profile_clicks: number;
        linkedin_clicks: number;
        website_clicks: number;
      }>();
    if (!row) return null;
    return {
      profileClicks: row.profile_clicks ?? 0,
      linkedinClicks: row.linkedin_clicks,
      websiteClicks: row.website_clicks,
    };
  }

  async listFoundingProfiles(): Promise<ProfileRow[]> {
    const { results } = await this.db
      .prepare(`SELECT * FROM profiles WHERE is_founding_member = 1`)
      .all<ProfileSql>();
    return results.map(mapProfile);
  }

  async createPendingBid(
    input: CreatePendingBidInput,
    now: number,
  ): Promise<BidRow> {
    let listing = await this.db
      .prepare(`SELECT * FROM listings WHERE profile_id = ? AND board_id = 'global'`)
      .bind(input.profileId)
      .first<ListingSql>();
    if (!listing) {
      listing = {
        id: newId("lst"),
        profile_id: input.profileId,
        current_bid_cents: 0,
        current_bid_at: now,
        current_bid_id: null,
        previous_rank: null,
        status: "active",
        created_at: now,
      };
      await this.db
        .prepare(
          `INSERT INTO listings (
            id, profile_id, board_id, status, current_bid_cents, current_bid_id,
            current_bid_at, created_at
          ) VALUES (?, ?, 'global', 'active', 0, NULL, ?, ?)`,
        )
        .bind(listing.id, input.profileId, now, now)
        .run();
    }
    const bid: BidRow = {
      id: newId("bid"),
      listingId: listing.id,
      profileId: input.profileId,
      amountCents: input.amountCents,
      status: "pending",
      stripeCheckoutSessionId: input.checkoutSessionId,
      stripePaymentIntentId: null,
    };
    await this.db
      .prepare(
        `INSERT INTO bids (
          id, listing_id, profile_id, board_id, amount_cents, currency,
          stripe_checkout_session_id, status, created_at
        ) VALUES (?, ?, ?, 'global', ?, 'usd', ?, 'pending', ?)`,
      )
      .bind(
        bid.id,
        bid.listingId,
        bid.profileId,
        bid.amountCents,
        bid.stripeCheckoutSessionId,
        now,
      )
      .run();
    return bid;
  }

  async attachCheckoutSession(
    bidId: string,
    checkoutSessionId: string,
  ): Promise<void> {
    await this.db
      .prepare(`UPDATE bids SET stripe_checkout_session_id = ? WHERE id = ?`)
      .bind(checkoutSessionId, bidId)
      .run();
  }

  async applyPayment(input: ApplyPaymentInput) {
    const inserted = await this.db
      .prepare(
        `INSERT OR IGNORE INTO stripe_events (id, type, bid_id, processed_at)
         VALUES (?, ?, ?, ?)`,
      )
      .bind(input.eventId, input.eventType, input.bidId ?? null, input.paidAt)
      .run();
    if ((inserted.meta?.changes ?? 0) === 0) {
      return { outcome: "idempotent" as const };
    }
    if (input.action === "refund") {
      return this.revertConfirmedBid(input);
    }
    const bidSql = await this.findBid(input);
    if (!bidSql) {
      return { outcome: "refund" as const, reason: "unknown_bid" as const };
    }
    const bid = mapBid(bidSql);
    const listingSql = await this.db
      .prepare(`SELECT * FROM listings WHERE id = ?`)
      .bind(bid.listingId)
      .first<ListingSql>();
    const listing = listingSql ? mapListing(listingSql) : undefined;
    const before = await this.rankSnapshots();
    const applied = applyConfirmedPayment(
      {
        listings:
          listing?.currentBidId
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
        processedEventIds: [],
      },
      {
        eventId: input.eventId,
        bidId: bid.id,
        listingId: bid.listingId,
        amountCents: input.amountCents ?? bid.amountCents,
        paidAt: input.paidAt,
      },
      await this.getEconomics(),
    );
    if (applied.result.outcome === "refund") {
      await this.db
        .prepare(
          `UPDATE bids SET status = 'refunded', refunded_at = ?, rejected_reason = ? WHERE id = ?`,
        )
        .bind(input.paidAt, applied.result.reason, bid.id)
        .run();
      return applied.result;
    }
    if (applied.result.outcome !== "confirmed") {
      return applied.result;
    }
    const next = applied.board.listings[bid.listingId];
    const expected = listing?.currentBidId ? listing.currentBidCents : null;
    const cas = await this.db
      .prepare(
        expected === null
          ? `UPDATE listings SET current_bid_cents = ?, current_bid_at = ?, current_bid_id = ?
             WHERE id = ? AND current_bid_id IS NULL`
          : `UPDATE listings SET current_bid_cents = ?, current_bid_at = ?, current_bid_id = ?
             WHERE id = ? AND current_bid_cents = ?`,
      )
      .bind(
        ...(expected === null
          ? [next.currentBidCents, next.currentBidAt, bid.id, bid.listingId]
          : [
              next.currentBidCents,
              next.currentBidAt,
              bid.id,
              bid.listingId,
              expected,
            ]),
      )
      .run();
    if ((cas.meta?.changes ?? 0) === 0) {
      await this.db
        .prepare(
          `UPDATE bids SET status = 'refunded', refunded_at = ?, rejected_reason = 'lost_race' WHERE id = ?`,
        )
        .bind(input.paidAt, bid.id)
        .run();
      return { outcome: "refund" as const, reason: "not_an_overtake" as const };
    }
    await this.db
      .prepare(
        `UPDATE bids SET status = 'confirmed', confirmed_at = ?, stripe_payment_intent_id = ? WHERE id = ?`,
      )
      .bind(input.paidAt, input.paymentIntentId ?? null, bid.id)
      .run();
    const countRow = await this.db
      .prepare(
        `SELECT COUNT(*) as n FROM listings WHERE board_id = 'global' AND current_bid_id IS NOT NULL`,
      )
      .first<{ n: number }>();
    if ((countRow?.n ?? 0) <= 100) {
      await this.db
        .prepare(`UPDATE profiles SET is_founding_member = 1 WHERE id = ?`)
        .bind(bid.profileId)
        .run();
    }
    const after = await this.rankSnapshots();
    const actor = after.find((row) => row.listingId === bid.listingId);
    const firstTime = !listing?.currentBidId;
    await this.db
      .prepare(
        `INSERT INTO events (id, type, board_id, actor_profile_id, target_profile_id, bid_id, amount_cents, rank_after, created_at)
         VALUES (?, ?, 'global', ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        newId("evt"),
        firstTime ? "joined" : "bid_confirmed",
        bid.profileId,
        bid.profileId,
        bid.id,
        next.currentBidCents,
        actor?.rank ?? null,
        input.paidAt,
      )
      .run();
    for (const fallen of listingsThatFell(before, after, bid.listingId)) {
      const eventId = newId("evt");
      await this.db
        .prepare(
          `INSERT INTO events (id, type, board_id, actor_profile_id, target_profile_id, bid_id, amount_cents, rank_after, created_at)
           VALUES (?, 'outbid', 'global', ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          eventId,
          bid.profileId,
          fallen.profileId,
          bid.id,
          next.currentBidCents,
          fallen.rank,
          input.paidAt,
        )
        .run();
      const target = await this.db
        .prepare(
          `SELECT u.id as user_id, u.email FROM profiles p JOIN users u ON u.id = p.user_id WHERE p.id = ?`,
        )
        .bind(fallen.profileId)
        .first<{ user_id: string; email: string }>();
      const unsub = target
        ? await this.db
            .prepare(`SELECT email FROM email_unsubscribes WHERE email = ?`)
            .bind(target.email)
            .first<{ email: string }>()
        : null;
      if (target && !unsub) {
        await this.db
          .prepare(
            `INSERT INTO outbid_notifications (id, event_id, user_id, email, status, created_at)
             VALUES (?, ?, ?, ?, 'pending', ?)`,
          )
          .bind(newId("ntf"), eventId, target.user_id, target.email, input.paidAt)
          .run();
      }
    }
    for (const row of before) {
      await this.db
        .prepare(`UPDATE listings SET previous_rank = ? WHERE id = ?`)
        .bind(row.rank, row.listingId)
        .run();
    }
    return applied.result;
  }

  async hideListing(listingId: string, hidden: boolean, now: number): Promise<void> {
    const listing = await this.db
      .prepare(`SELECT profile_id FROM listings WHERE id = ?`)
      .bind(listingId)
      .first<{ profile_id: string }>();
    if (!listing) throw new Error("listing_missing");
    await this.db
      .prepare(`UPDATE listings SET status = ? WHERE id = ?`)
      .bind(hidden ? "hidden" : "active", listingId)
      .run();
    await this.db
      .prepare(
        `INSERT INTO events (id, type, board_id, target_profile_id, created_at)
         VALUES (?, ?, 'global', ?, ?)`,
      )
      .bind(
        newId("evt"),
        hidden ? "listing_hidden" : "listing_unhidden",
        listing.profile_id,
        now,
      )
      .run();
  }

  async setFounding(profileId: string, value: boolean): Promise<void> {
    await this.db
      .prepare(`UPDATE profiles SET is_founding_member = ? WHERE id = ?`)
      .bind(value ? 1 : 0, profileId)
      .run();
  }

  async unsubscribe(email: string, token: string, now: number): Promise<void> {
    await this.db
      .prepare(
        `INSERT OR REPLACE INTO email_unsubscribes (email, token, created_at) VALUES (?, ?, ?)`,
      )
      .bind(email, token, now)
      .run();
  }

  async takePendingNotifications(limit: number): Promise<NotificationRow[]> {
    const { results } = await this.db
      .prepare(
        `SELECT id, event_id, user_id, email, status FROM outbid_notifications
         WHERE status = 'pending' LIMIT ?`,
      )
      .bind(limit)
      .all<NotificationRow & { event_id: string; user_id: string }>();
    return results.map((row) => ({
      id: row.id,
      eventId: row.event_id,
      userId: row.user_id,
      email: row.email,
      status: row.status,
    }));
  }

  async markNotification(
    id: string,
    status: "sent" | "failed" | "skipped_unsubscribed",
    now: number,
  ): Promise<void> {
    await this.db
      .prepare(
        `UPDATE outbid_notifications SET status = ?, sent_at = ? WHERE id = ?`,
      )
      .bind(status, now, id)
      .run();
  }

  async adminOverview() {
    const users = await this.db.prepare(`SELECT COUNT(*) as n FROM users`).first<{ n: number }>();
    const profiles = await this.db
      .prepare(`SELECT COUNT(*) as n FROM profiles`)
      .first<{ n: number }>();
    const live = await this.db
      .prepare(
        `SELECT COUNT(*) as n FROM listings WHERE board_id = 'global' AND status = 'active' AND current_bid_id IS NOT NULL`,
      )
      .first<{ n: number }>();
    const pending = await this.db
      .prepare(`SELECT COUNT(*) as n FROM bids WHERE status = 'pending'`)
      .first<{ n: number }>();
    return {
      users: users?.n ?? 0,
      profiles: profiles?.n ?? 0,
      liveListings: live?.n ?? 0,
      pendingBids: pending?.n ?? 0,
    };
  }

  private async revertConfirmedBid(input: ApplyPaymentInput) {
    const bidSql = await this.findBid(input);
    if (!bidSql) {
      return { outcome: "refund" as const, reason: "unknown_bid" as const };
    }
    const bid = mapBid(bidSql);
    await this.db
      .prepare(
        `UPDATE bids SET status = 'refunded', refunded_at = ?, rejected_reason = 'provider_refund' WHERE id = ?`,
      )
      .bind(input.paidAt, bid.id)
      .run();
    const listingSql = await this.db
      .prepare(`SELECT * FROM listings WHERE id = ?`)
      .bind(bid.listingId)
      .first<ListingSql>();
    if (listingSql?.current_bid_id === bid.id) {
      const previous = await this.db
        .prepare(
          `SELECT * FROM bids
           WHERE listing_id = ? AND status = 'confirmed' AND id != ?
           ORDER BY confirmed_at DESC LIMIT 1`,
        )
        .bind(bid.listingId, bid.id)
        .first<BidSql>();
      if (previous) {
        await this.db
          .prepare(
            `UPDATE listings SET current_bid_cents = ?, current_bid_at = ?, current_bid_id = ? WHERE id = ?`,
          )
          .bind(
            previous.amount_cents,
            previous.confirmed_at ?? input.paidAt,
            previous.id,
            bid.listingId,
          )
          .run();
      } else {
        await this.db
          .prepare(
            `UPDATE listings SET current_bid_cents = 0, current_bid_id = NULL WHERE id = ?`,
          )
          .bind(bid.listingId)
          .run();
      }
    }
    await this.db
      .prepare(
        `INSERT INTO events (id, type, board_id, actor_profile_id, target_profile_id, bid_id, amount_cents, rank_after, created_at)
         VALUES (?, 'refunded', 'global', ?, ?, ?, ?, NULL, ?)`,
      )
      .bind(
        newId("evt"),
        bid.profileId,
        bid.profileId,
        bid.id,
        bid.amountCents,
        input.paidAt,
      )
      .run();
    return { outcome: "reverted" as const, listingId: bid.listingId };
  }

  private async findBid(input: ApplyPaymentInput): Promise<BidSql | null> {
    if (input.bidId) {
      return this.db.prepare(`SELECT * FROM bids WHERE id = ?`).bind(input.bidId).first<BidSql>();
    }
    if (input.checkoutSessionId) {
      return this.db
        .prepare(`SELECT * FROM bids WHERE stripe_checkout_session_id = ?`)
        .bind(input.checkoutSessionId)
        .first<BidSql>();
    }
    if (input.paymentIntentId) {
      return this.db
        .prepare(`SELECT * FROM bids WHERE stripe_payment_intent_id = ?`)
        .bind(input.paymentIntentId)
        .first<BidSql>();
    }
    return null;
  }

  private async publicRows(): Promise<PublicBoardRow[]> {
    const { results } = await this.db
      .prepare(
        `SELECT l.id as listing_id, l.profile_id, l.current_bid_cents, l.current_bid_at,
                l.previous_rank, p.handle, p.display_name, p.headline, p.company, p.pitch,
                p.photo_r2_key, p.linkedin_url, p.website_url, p.linkedin_clicks, p.website_clicks,
                p.profile_clicks, p.is_founding_member, p.created_at
         FROM listings l
         JOIN profiles p ON p.id = l.profile_id
         WHERE l.board_id = 'global' AND l.status = 'active' AND l.current_bid_id IS NOT NULL`,
      )
      .all<{
        listing_id: string;
        profile_id: string;
        current_bid_cents: number;
        current_bid_at: number;
        previous_rank: number | null;
        handle: string;
        display_name: string;
        headline: string;
        company: string | null;
        pitch: string;
        photo_r2_key: string | null;
        linkedin_url: string | null;
        website_url: string | null;
        linkedin_clicks: number;
        website_clicks: number;
        profile_clicks: number;
        is_founding_member: number;
        created_at: number;
      }>();
    return results.map((row) => ({
      listingId: row.listing_id,
      profileId: row.profile_id,
      handle: row.handle,
      displayName: row.display_name,
      headline: row.headline,
      company: row.company,
      pitch: row.pitch,
      photoUrl: row.photo_r2_key,
      linkedinUrl: row.linkedin_url,
      websiteUrl: row.website_url,
      linkedinClicks: row.linkedin_clicks ?? 0,
      websiteClicks: row.website_clicks ?? 0,
      profileClicks: row.profile_clicks ?? 0,
      isFoundingMember: row.is_founding_member === 1,
      currentBidCents: row.current_bid_cents,
      currentBidAt: row.current_bid_at,
      profileCreatedAt: row.created_at,
      previousRank: row.previous_rank,
    }));
  }

  private async rankedActive(): Promise<RankedBoardRow[]> {
    const rows = await this.publicRows();
    return rankListings(rows.map((row) => ({ ...row, id: row.listingId }))).map(
      (row) => ({
        ...row,
        movement: movementFor(row.rank, row.previousRank),
      }),
    );
  }

  private async rankSnapshots() {
    return (await this.rankedActive()).map((row) => ({
      listingId: row.listingId,
      profileId: row.profileId,
      rank: row.rank,
    }));
  }
}
