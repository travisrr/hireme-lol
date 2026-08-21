export type LegalKind = "privacy" | "terms";

export type LegalBlock = {
  heading?: string;
  paragraphs: string[];
};

export type LegalDoc = {
  kind: LegalKind;
  title: string;
  updated: string;
  blocks: LegalBlock[];
};

export const LEGAL_UPDATED = "Updated August 21, 2026";

export const CONTACT_EMAIL = "hello@workwithme.lol";

export const CONTACT_LINE = `Questions about the board: ${CONTACT_EMAIL}.`;

export const PRIVACY_DOC: LegalDoc = {
  kind: "privacy",
  title: "Privacy",
  updated: LEGAL_UPDATED,
  blocks: [
    {
      paragraphs: [
        "workwithme.lol is a public professional leaderboard. Bid for rank. Your listing is meant to be seen.",
      ],
    },
    {
      heading: "What we collect",
      paragraphs: [
        "When you sign in with LinkedIn we receive the name, photo, and headline you approve. You can edit those before you bid. We also store the industry you pick, your bid amounts, rank, and click counts on your LinkedIn and site links. Payments run through Stripe. We do not store your full card number.",
      ],
    },
    {
      heading: "What is public",
      paragraphs: [
        "Your name, photo, headline, industry, rank, and bid amount appear on the board. That is the product.",
      ],
    },
    {
      heading: "What we don’t do",
      paragraphs: [
        "We don’t sell your data. We don’t scrape LinkedIn. We don’t run a job board. Clicks on your links go to you.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [CONTACT_LINE],
    },
  ],
};

export const TERMS_DOC: LegalDoc = {
  kind: "terms",
  title: "Terms",
  updated: LEGAL_UPDATED,
  blocks: [
    {
      paragraphs: [
        "workwithme.lol is a paid placement leaderboard. Money buys rank, not quality. It is not LinkedIn and not a job board.",
      ],
    },
    {
      heading: "Bidding",
      paragraphs: [
        "$2 to enter. +$2 to overtake the rank above you. Stripe Checkout is the only way a bid counts. If you get outbid, your listing stays on the board at the new rank. Bids are not refunded because someone passed you.",
      ],
    },
    {
      heading: "Your listing",
      paragraphs: [
        "You are responsible for the name, photo, headline, and links you publish. Don’t impersonate anyone. We can remove a listing that is fake, illegal, or abusive.",
      ],
    },
    {
      heading: "The board",
      paragraphs: [
        "Ranks change when someone pays. We don’t promise leads, hires, or a job. Your LinkedIn and site take the clicks.",
        "These terms are the rules of the site. If you don’t want to bid, don’t.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [CONTACT_LINE],
    },
  ],
};

export function legalDoc(kind: LegalKind): LegalDoc {
  switch (kind) {
    case "privacy":
      return PRIVACY_DOC;
    case "terms":
      return TERMS_DOC;
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}
