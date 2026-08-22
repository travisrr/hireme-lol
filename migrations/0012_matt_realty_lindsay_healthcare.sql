-- Matt is real estate. Lindsay is healthcare. Each belongs on that tab.
UPDATE profiles
SET category_id = 'real-estate'
WHERE handle = 'matthewrhodes';

UPDATE profiles
SET category_id = 'healthcare'
WHERE handle = 'lindsayplcsw';
