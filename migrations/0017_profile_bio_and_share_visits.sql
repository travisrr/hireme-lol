-- Bidder settings: long-form bio + unique inbound share visits for rank juice.
-- Share juice is a capped, decaying credit. It cannot beat a full paid overtake.

ALTER TABLE profiles ADD COLUMN bio TEXT NOT NULL DEFAULT '';

CREATE TABLE share_visits (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL,
  platform TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE (listing_id, visitor_hash)
);

CREATE INDEX share_visits_listing_created_idx
  ON share_visits (listing_id, created_at DESC);
