-- Founding three are Technology. 'founders' is not a board tab, so Trending
-- showed a blank industry next to Elon, Palmer, and Jensen.
UPDATE profiles
SET category_id = 'technology'
WHERE handle IN ('elon', 'palmer', 'jensen');
