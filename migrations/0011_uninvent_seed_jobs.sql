-- Undo invented seed job titles from 0010. Board rows do not show a job line.
UPDATE profiles
SET headline = 'Founding member',
    pitch = 'Founding bid.'
WHERE handle IN ('elon', 'palmer', 'jensen') AND is_founding_member = 1;