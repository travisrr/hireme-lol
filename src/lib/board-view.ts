import type { RankedBoardRow } from "../server/store";
import { publicPhotoSrc } from "./photo";
import type { RankedPublicListing } from "./types";

export function toPublicListing(row: RankedBoardRow): RankedPublicListing {
  return {
    id: row.listingId,
    handle: row.handle,
    displayName: row.displayName,
    headline: row.headline,
    company: row.company,
    pitch: row.pitch,
    photoUrl: publicPhotoSrc(row.photoUrl),
    linkedinUrl: row.linkedinUrl,
    websiteUrl: row.websiteUrl,
    linkedinClicks: row.linkedinClicks ?? 0,
    websiteClicks: row.websiteClicks ?? 0,
    profileClicks: row.profileClicks ?? 0,
    isFoundingMember: row.isFoundingMember,
    currentBidCents: row.currentBidCents,
    currentBidAt: row.currentBidAt,
    profileCreatedAt: row.profileCreatedAt,
    previousRank: row.previousRank,
    boardId: "global",
    industry: row.industry,
    categories: row.categories,
    rank: row.rank,
    movement: row.movement,
  };
}
