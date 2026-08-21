export type RankSnapshot = {
  listingId: string;
  profileId: string;
  rank: number;
};

export function listingsThatFell(
  before: readonly RankSnapshot[],
  after: readonly RankSnapshot[],
  actorListingId: string,
): RankSnapshot[] {
  const previous = new Map(before.map((row) => [row.listingId, row]));
  return after.filter((row) => {
    if (row.listingId === actorListingId) return false;
    const prior = previous.get(row.listingId);
    if (!prior) return false;
    return row.rank > prior.rank;
  });
}
