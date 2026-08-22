-- Matt joined without a title. Board rows show headline/pitch in that slot.
UPDATE profiles
SET headline = 'President and Broker',
    pitch = 'President and Broker'
WHERE handle = 'matthewrhodes'
  AND trim(headline) = '';
