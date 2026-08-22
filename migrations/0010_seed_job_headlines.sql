-- Real public titles on seed profiles. Never use "Founding member" as the job line.
UPDATE profiles
SET headline = 'CEO at Tesla, SpaceX, and xAI',
    pitch = 'CEO at Tesla, SpaceX, and xAI'
WHERE handle = 'elon' AND is_founding_member = 1;

UPDATE profiles
SET headline = 'Founder at Anduril',
    pitch = 'Founder at Anduril'
WHERE handle = 'palmer' AND is_founding_member = 1;

UPDATE profiles
SET headline = 'President and CEO at NVIDIA',
    pitch = 'President and CEO at NVIDIA'
WHERE handle = 'jensen' AND is_founding_member = 1;