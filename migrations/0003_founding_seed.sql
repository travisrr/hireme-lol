-- Founding seed. Elon $6 / Palmer $4 / Jensen $2.
-- Names and bid amounts only. No scraped bios, photos, or LinkedIn URLs.

INSERT OR IGNORE INTO users (id, email, email_verified_at, created_at, last_login_at)
VALUES
  ('usr_founding_elon', 'founding+elon@workwithme.lol', 1755808000000, 1755808000000, 1755808000000),
  ('usr_founding_palmer', 'founding+palmer@workwithme.lol', 1755808001000, 1755808001000, 1755808001000),
  ('usr_founding_jensen', 'founding+jensen@workwithme.lol', 1755808002000, 1755808002000, 1755808002000);

INSERT OR IGNORE INTO profiles (
  id, user_id, handle, display_name, headline, company, pitch,
  photo_r2_key, linkedin_url, website_url, is_founding_member, created_at, updated_at
)
VALUES
  ('prf_founding_elon', 'usr_founding_elon', 'elon', 'Elon Musk', 'Founding member', NULL, 'Founding bid.', NULL, NULL, NULL, 1, 1755808000000, 1755808000000),
  ('prf_founding_palmer', 'usr_founding_palmer', 'palmer', 'Palmer Luckey', 'Founding member', NULL, 'Founding bid.', NULL, NULL, NULL, 1, 1755808001000, 1755808001000),
  ('prf_founding_jensen', 'usr_founding_jensen', 'jensen', 'Jensen Huang', 'Founding member', NULL, 'Founding bid.', NULL, NULL, NULL, 1, 1755808002000, 1755808002000);

INSERT OR IGNORE INTO listings (
  id, profile_id, board_id, status, current_bid_cents, current_bid_id,
  current_bid_at, previous_rank, created_at
)
VALUES
  ('lst_founding_elon', 'prf_founding_elon', 'global', 'active', 600, NULL, 1755808003000, NULL, 1755808000000),
  ('lst_founding_palmer', 'prf_founding_palmer', 'global', 'active', 400, NULL, 1755808002000, NULL, 1755808001000),
  ('lst_founding_jensen', 'prf_founding_jensen', 'global', 'active', 200, NULL, 1755808001000, NULL, 1755808002000);

INSERT OR IGNORE INTO bids (
  id, listing_id, profile_id, board_id, amount_cents, currency,
  stripe_checkout_session_id, stripe_payment_intent_id, status,
  rejected_reason, created_at, confirmed_at, refunded_at
)
VALUES
  ('bid_founding_elon', 'lst_founding_elon', 'prf_founding_elon', 'global', 600, 'usd', NULL, NULL, 'confirmed', NULL, 1755808003000, 1755808003000, NULL),
  ('bid_founding_palmer', 'lst_founding_palmer', 'prf_founding_palmer', 'global', 400, 'usd', NULL, NULL, 'confirmed', NULL, 1755808002000, 1755808002000, NULL),
  ('bid_founding_jensen', 'lst_founding_jensen', 'prf_founding_jensen', 'global', 200, 'usd', NULL, NULL, 'confirmed', NULL, 1755808001000, 1755808001000, NULL);

UPDATE listings SET current_bid_id = 'bid_founding_elon' WHERE id = 'lst_founding_elon';
UPDATE listings SET current_bid_id = 'bid_founding_palmer' WHERE id = 'lst_founding_palmer';
UPDATE listings SET current_bid_id = 'bid_founding_jensen' WHERE id = 'lst_founding_jensen';

INSERT OR IGNORE INTO events (
  id, type, board_id, actor_profile_id, target_profile_id, bid_id,
  amount_cents, rank_after, created_at
)
VALUES
  ('evt_founding_jensen', 'bid_confirmed', 'global', 'prf_founding_jensen', NULL, 'bid_founding_jensen', 200, 1, 1755808001000),
  ('evt_founding_palmer', 'bid_confirmed', 'global', 'prf_founding_palmer', NULL, 'bid_founding_palmer', 400, 1, 1755808002000),
  ('evt_founding_elon', 'bid_confirmed', 'global', 'prf_founding_elon', NULL, 'bid_founding_elon', 600, 1, 1755808003000);
