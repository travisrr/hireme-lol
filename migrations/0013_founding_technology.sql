-- Founding three are Technology so Trending shows that industry next to
-- Elon, Palmer, and Jensen. The old seed slug was not a board tab.
UPDATE profiles
SET category_id = 'technology'
WHERE handle IN ('elon', 'palmer', 'jensen');
