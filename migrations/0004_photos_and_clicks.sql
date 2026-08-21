-- Click counters start at 0 and only move on real taps.
ALTER TABLE profiles ADD COLUMN linkedin_clicks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN website_clicks INTEGER NOT NULL DEFAULT 0;

-- Public LinkedIn URLs for founding seed. Photos come from OG/meta → R2, or stay empty.
UPDATE profiles SET linkedin_url = 'https://www.linkedin.com/in/elonmusk'
  WHERE id = 'prf_founding_elon';
UPDATE profiles SET linkedin_url = 'https://www.linkedin.com/in/palmerluckey'
  WHERE id = 'prf_founding_palmer';
UPDATE profiles SET linkedin_url = 'https://www.linkedin.com/in/jenhsunhuang'
  WHERE id = 'prf_founding_jensen';
