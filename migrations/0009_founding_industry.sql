-- Founding three sit on Founders. Other category tabs stay empty until a real bid.
UPDATE profiles
SET category_id = 'founders'
WHERE handle IN ('elon', 'palmer', 'jensen');
