-- 80px WebP (2x for the 40 tile). Same Wikimedia/press faces. No new people.
UPDATE profiles
  SET photo_r2_key = 'photos/founding-elon.webp'
  WHERE photo_r2_key = 'photos/founding-elon.jpg';
UPDATE profiles
  SET photo_r2_key = 'photos/founding-palmer.webp'
  WHERE photo_r2_key = 'photos/founding-palmer.jpg';
UPDATE profiles
  SET photo_r2_key = 'photos/founding-jensen.webp'
  WHERE photo_r2_key = 'photos/founding-jensen.jpg';
