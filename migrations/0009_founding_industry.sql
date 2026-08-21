-- Founding three sit on Technology. Other industry tabs stay empty until a real bid.
UPDATE profiles
SET category_id = 'technology'
WHERE handle IN ('elon', 'palmer', 'jensen') AND category_id IS NULL;
