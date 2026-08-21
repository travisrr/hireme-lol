import { movementFor, rankListings } from "../lib/ranking";
import type { BoardActivity, PublicListing, RankedPublicListing } from "../lib/types";

/**
 * FOUNDING PREVIEW ONLY.
 * These rows are mock. They are not live users, not live bids, not production stats.
 * Production must start with an empty D1 board.
 */

const PREVIEW_NOW = Date.parse("2026-08-21T18:00:00.000Z");

function photo(seed: string): string {
  const params = new URLSearchParams({
    seed,
    backgroundColor: "14140f",
  });
  return `https://api.dicebear.com/9.x/notionists/svg?${params.toString()}`;
}

const RAW: PublicListing[] = [
  {
    id: "lst_maya",
    handle: "maya",
    displayName: "Maya Chen",
    headline: "Staff product designer",
    company: "Independent",
    pitch: "I make the first version look inevitable.",
    photoUrl: photo("maya-chen"),
    linkedinUrl: "https://www.linkedin.com/in/example-maya",
    websiteUrl: "https://maya.example",
    isFoundingMember: true,
    currentBidCents: 240000,
    currentBidAt: PREVIEW_NOW - 1000 * 60 * 42,
    profileCreatedAt: PREVIEW_NOW - 1000 * 60 * 60 * 20,
    previousRank: 2,
    boardId: "global",
  },
  {
    id: "lst_andre",
    handle: "andre",
    displayName: "Andre Walker",
    headline: "Founding engineer",
    company: "Northline",
    pitch: "Ships the ugly path first, then deletes it.",
    photoUrl: photo("andre-walker"),
    linkedinUrl: "https://www.linkedin.com/in/example-andre",
    websiteUrl: "https://and.re.example",
    isFoundingMember: true,
    currentBidCents: 181500,
    currentBidAt: PREVIEW_NOW - 1000 * 60 * 18,
    profileCreatedAt: PREVIEW_NOW - 1000 * 60 * 60 * 19,
    previousRank: 1,
    boardId: "global",
  },
  {
    id: "lst_priya",
    handle: "priya",
    displayName: "Priya Nair",
    headline: "Brand + campaigns",
    company: "Atelier Nair",
    pitch: "If they remember one sentence, I wrote it.",
    photoUrl: photo("priya-nair"),
    linkedinUrl: null,
    websiteUrl: "https://atelier.nair.example",
    isFoundingMember: true,
    currentBidCents: 99000,
    currentBidAt: PREVIEW_NOW - 1000 * 60 * 75,
    profileCreatedAt: PREVIEW_NOW - 1000 * 60 * 60 * 18,
    previousRank: 3,
    boardId: "global",
  },
  {
    id: "lst_jonas",
    handle: "jonas",
    displayName: "Jonas Hale",
    headline: "GTM for unloved tools",
    company: "Hale Partners",
    pitch: "I sell the thing engineers are too proud to demo.",
    photoUrl: photo("jonas-hale"),
    linkedinUrl: "https://www.linkedin.com/in/example-jonas",
    websiteUrl: "https://hale.example",
    isFoundingMember: true,
    currentBidCents: 76000,
    currentBidAt: PREVIEW_NOW - 1000 * 60 * 12,
    profileCreatedAt: PREVIEW_NOW - 1000 * 60 * 60 * 17,
    previousRank: 6,
    boardId: "global",
  },
  {
    id: "lst_leila",
    handle: "leila",
    displayName: "Leila Okonkwo",
    headline: "Security engineer",
    company: "Vesper",
    pitch: "I find the door you left open on purpose.",
    photoUrl: photo("leila-okonkwo"),
    linkedinUrl: "https://www.linkedin.com/in/example-leila",
    websiteUrl: "https://vesper.example/leila",
    isFoundingMember: true,
    currentBidCents: 52000,
    currentBidAt: PREVIEW_NOW - 1000 * 60 * 200,
    profileCreatedAt: PREVIEW_NOW - 1000 * 60 * 60 * 16,
    previousRank: 4,
    boardId: "global",
  },
  {
    id: "lst_nico",
    handle: "nico",
    displayName: "Nico Alvarez",
    headline: "Motion + product films",
    company: "Frame 24",
    pitch: "Thirty seconds. No stock footage. No mercy.",
    photoUrl: photo("nico-alvarez"),
    linkedinUrl: null,
    websiteUrl: "https://frame24.example",
    isFoundingMember: true,
    currentBidCents: 33300,
    currentBidAt: PREVIEW_NOW - 1000 * 60 * 8,
    profileCreatedAt: PREVIEW_NOW - 1000 * 60 * 60 * 15,
    previousRank: 8,
    boardId: "global",
  },
  {
    id: "lst_samira",
    handle: "samira",
    displayName: "Samira Haddad",
    headline: "Ops who can close",
    company: "Independent",
    pitch: "Your pipeline is a hallway. I put doors on it.",
    photoUrl: photo("samira-haddad"),
    linkedinUrl: "https://www.linkedin.com/in/example-samira",
    websiteUrl: "https://haddad.example",
    isFoundingMember: true,
    currentBidCents: 25000,
    currentBidAt: PREVIEW_NOW - 1000 * 60 * 55,
    profileCreatedAt: PREVIEW_NOW - 1000 * 60 * 60 * 14,
    previousRank: 5,
    boardId: "global",
  },
  {
    id: "lst_owen",
    handle: "owen",
    displayName: "Owen Park",
    headline: "Frontend systems",
    company: "Kite",
    pitch: "Design systems that survive a reorg.",
    photoUrl: photo("owen-park"),
    linkedinUrl: "https://www.linkedin.com/in/example-owen",
    websiteUrl: "https://owenpark.example",
    isFoundingMember: true,
    currentBidCents: 18000,
    currentBidAt: PREVIEW_NOW - 1000 * 60 * 240,
    profileCreatedAt: PREVIEW_NOW - 1000 * 60 * 60 * 13,
    previousRank: 7,
    boardId: "global",
  },
  {
    id: "lst_ravi",
    handle: "ravi",
    displayName: "Ravi Menon",
    headline: "Data + decision science",
    company: "Lumen",
    pitch: "I tell the board which number is lying.",
    photoUrl: photo("ravi-menon"),
    linkedinUrl: null,
    websiteUrl: "https://menon.example",
    isFoundingMember: false,
    currentBidCents: 12400,
    currentBidAt: PREVIEW_NOW - 1000 * 60 * 33,
    profileCreatedAt: PREVIEW_NOW - 1000 * 60 * 60 * 10,
    previousRank: 11,
    boardId: "global",
  },
  {
    id: "lst_elena",
    handle: "elena",
    displayName: "Elena Voss",
    headline: "General counsel (startup)",
    company: "Voss Law",
    pitch: "I write the sentence that keeps you out of court.",
    photoUrl: photo("elena-voss"),
    linkedinUrl: "https://www.linkedin.com/in/example-elena",
    websiteUrl: "https://vosslaw.example",
    isFoundingMember: false,
    currentBidCents: 10100,
    currentBidAt: PREVIEW_NOW - 1000 * 60 * 90,
    profileCreatedAt: PREVIEW_NOW - 1000 * 60 * 60 * 9,
    previousRank: 9,
    boardId: "global",
  },
  {
    id: "lst_theo",
    handle: "theo",
    displayName: "Theo Brooks",
    headline: "Audio / podcast producer",
    company: "Room Tone",
    pitch: "Your founder sounds expensive. I keep that.",
    photoUrl: photo("theo-brooks"),
    linkedinUrl: null,
    websiteUrl: "https://roomtone.example",
    isFoundingMember: false,
    currentBidCents: 5000,
    currentBidAt: PREVIEW_NOW - 1000 * 60 * 6,
    profileCreatedAt: PREVIEW_NOW - 1000 * 60 * 60 * 4,
    previousRank: null,
    boardId: "global",
  },
  {
    id: "lst_aisha",
    handle: "aisha",
    displayName: "Aisha Grant",
    headline: "Executive coach",
    company: "Grant Studio",
    pitch: "For people who already won and hate it.",
    photoUrl: photo("aisha-grant"),
    linkedinUrl: "https://www.linkedin.com/in/example-aisha",
    websiteUrl: "https://grant.studio.example",
    isFoundingMember: false,
    currentBidCents: 5000,
    currentBidAt: PREVIEW_NOW - 1000 * 60 * 21,
    profileCreatedAt: PREVIEW_NOW - 1000 * 60 * 60 * 8,
    previousRank: 12,
    boardId: "global",
  },
];

export const MOCK_BOARD_NOTICE =
  "FOUNDING PREVIEW — mock board. Not live. These are not real users, bids, or stats. Production starts empty.";

export const MOCK_RANKED: RankedPublicListing[] = rankListings(RAW).map(
  (row) => ({
    ...row,
    movement: movementFor(row.rank, row.previousRank),
  }),
);

export const MOCK_ACTIVITY: BoardActivity[] = [
  {
    id: "evt_1",
    type: "bid_confirmed",
    handle: "theo",
    displayName: "Theo Brooks",
    amountCents: 5000,
    rankAfter: 12,
    createdAt: PREVIEW_NOW - 1000 * 60 * 6,
    mock: true,
  },
  {
    id: "evt_2",
    type: "outbid",
    handle: "andre",
    displayName: "Andre Walker",
    amountCents: 181500,
    rankAfter: 2,
    createdAt: PREVIEW_NOW - 1000 * 60 * 18,
    mock: true,
  },
  {
    id: "evt_3",
    type: "bid_confirmed",
    handle: "jonas",
    displayName: "Jonas Hale",
    amountCents: 76000,
    rankAfter: 4,
    createdAt: PREVIEW_NOW - 1000 * 60 * 12,
    mock: true,
  },
  {
    id: "evt_4",
    type: "joined",
    handle: "aisha",
    displayName: "Aisha Grant",
    amountCents: 5000,
    rankAfter: 12,
    createdAt: PREVIEW_NOW - 1000 * 60 * 21,
    mock: true,
  },
];

export function findMockByHandle(
  handle: string,
): RankedPublicListing | undefined {
  return MOCK_RANKED.find(
    (row) => row.handle.toLowerCase() === handle.toLowerCase(),
  );
}

export function filterMockBoard(query: string): RankedPublicListing[] {
  const q = query.trim().toLowerCase();
  if (!q) return MOCK_RANKED;
  return MOCK_RANKED.filter((row) => {
    const hay = [
      row.displayName,
      row.handle,
      row.headline,
      row.company ?? "",
      row.pitch,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
