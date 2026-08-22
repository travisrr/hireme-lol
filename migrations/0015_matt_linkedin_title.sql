-- Infer Matt's board title from his LinkedIn headline, not an invented short job.
UPDATE profiles
SET headline = 'President and Broker of Skyline Financial, Inc',
    pitch = 'President and Broker of Skyline Financial, Inc'
WHERE handle = 'matthewrhodes';
