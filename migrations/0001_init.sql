-- workwithme.lol v1 schema
-- One launched board: global. category_id / city_id / extra boards are reserved, not launched.

PRAGMA foreign_keys = ON;

CREATE TABLE boards (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('global', 'category', 'city')),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  is_launched INTEGER NOT NULL DEFAULT 0 CHECK (is_launched IN (0, 1)),
  created_at INTEGER NOT NULL
);

INSERT INTO boards (id, kind, slug, title, is_launched, created_at)
VALUES ('global', 'global', 'global', 'Global', 1, 0);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  email_verified_at INTEGER,
  created_at INTEGER NOT NULL,
  last_login_at INTEGER
);

CREATE TABLE oauth_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'github')),
  provider_user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE (provider, provider_user_id)
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX sessions_user_id_idx ON sessions (user_id);
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);

CREATE TABLE magic_links (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX magic_links_email_idx ON magic_links (email);

CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  handle TEXT NOT NULL COLLATE NOCASE UNIQUE,
  display_name TEXT NOT NULL,
  headline TEXT NOT NULL,
  company TEXT,
  pitch TEXT NOT NULL,
  photo_r2_key TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  is_founding_member INTEGER NOT NULL DEFAULT 0 CHECK (is_founding_member IN (0, 1)),
  -- Reserved. v1 queries MUST ignore these and use board_id = 'global' only.
  category_id TEXT,
  city_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX profiles_handle_idx ON profiles (handle);
CREATE INDEX profiles_created_at_idx ON profiles (created_at);

CREATE TABLE listings (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  board_id TEXT NOT NULL DEFAULT 'global' REFERENCES boards (id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  current_bid_cents INTEGER NOT NULL,
  current_bid_id TEXT,
  current_bid_at INTEGER NOT NULL,
  previous_rank INTEGER,
  created_at INTEGER NOT NULL,
  UNIQUE (profile_id, board_id)
);

CREATE INDEX listings_board_rank_idx
  ON listings (board_id, status, current_bid_cents DESC, current_bid_at ASC);

CREATE TABLE bids (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  board_id TEXT NOT NULL DEFAULT 'global' REFERENCES boards (id),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT NOT NULL CHECK (
    status IN ('pending', 'confirmed', 'refunded', 'rejected')
  ),
  rejected_reason TEXT,
  created_at INTEGER NOT NULL,
  confirmed_at INTEGER,
  refunded_at INTEGER
);

CREATE INDEX bids_listing_id_idx ON bids (listing_id);
CREATE INDEX bids_status_idx ON bids (status);
CREATE INDEX bids_payment_intent_idx ON bids (stripe_payment_intent_id);

CREATE TABLE stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  bid_id TEXT,
  processed_at INTEGER NOT NULL
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (
    type IN (
      'joined',
      'bid_confirmed',
      'outbid',
      'refunded',
      'listing_hidden',
      'listing_unhidden'
    )
  ),
  board_id TEXT NOT NULL DEFAULT 'global' REFERENCES boards (id),
  actor_profile_id TEXT REFERENCES profiles (id),
  target_profile_id TEXT REFERENCES profiles (id),
  bid_id TEXT REFERENCES bids (id),
  amount_cents INTEGER,
  rank_after INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX events_board_created_idx ON events (board_id, created_at DESC);

CREATE TABLE outbid_notifications (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('pending', 'sent', 'failed', 'skipped_unsubscribed')
  ),
  sent_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE email_unsubscribes (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE admin_audit (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL REFERENCES users (id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  meta_json TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE site_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Launch economics. Do not change without an explicit product decision.
INSERT INTO site_config (key, value, updated_at) VALUES
  ('min_entry_cents', '500', 0),
  ('min_increment_cents', '100', 0),
  ('public_origin', 'https://workwithme.lol', 0),
  ('board_mode', 'global_only', 0);
