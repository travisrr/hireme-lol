-- Founding three: license-clean Wikimedia portraits on R2. Not LinkedIn scrape.
UPDATE profiles
  SET photo_r2_key = 'photos/founding-elon.jpg'
  WHERE id = 'prf_founding_elon';
UPDATE profiles
  SET photo_r2_key = 'photos/founding-palmer.jpg'
  WHERE id = 'prf_founding_palmer';
UPDATE profiles
  SET photo_r2_key = 'photos/founding-jensen.jpg'
  WHERE id = 'prf_founding_jensen';
