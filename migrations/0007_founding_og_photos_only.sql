-- Founding photos: public LinkedIn og:image only. No Wikimedia / press hunt.
-- Elon and Palmer: LinkedIn returned no og:image (empty square).
-- Jensen: og:image from https://www.linkedin.com/in/jenhsunhuang stored on R2.
UPDATE profiles
  SET photo_r2_key = NULL
  WHERE id IN ('prf_founding_elon', 'prf_founding_palmer', 'prf_founding_jensen');
UPDATE profiles
  SET photo_r2_key = 'photos/og-jenhsunhuang.jpg'
  WHERE id = 'prf_founding_jensen';
