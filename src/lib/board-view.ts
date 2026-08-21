import type { RankedBoardRow } from "../server/store";
import { photoFallback } from "./photo";
import type { RankedPublicListing } from "./types";

export function toPublicListing(row: RankedBoardRow): RankedPublicListing {
  return {
    id: row.listingId,
    handle: row.handle,
    displayName: row.displayName,
    headline: row.headline,
    company: row.company,
    pitch: row.pitch,
    photoUrl: row.photoUrl || photoFallback(row.handle),
    linkedinUrl: row.linkedinUrl,
    websiteUrl: row.websiteUrl || `/${row.handle}`,
    isFoundingMember: row.isFoundingMember,
    currentBidCents: row.currentBidCents,
    currentBidAt: row.currentBidAt,
    profileCreatedAt: row.profileCreatedAt,
    previousRank: row.previousRank,
    boardId: "global",
    rank: row.rank,
    movement: row.movement,
  };
}
