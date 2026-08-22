import { BOARD_TABS, MAX_CATEGORIES } from "./industries";
import { CONTACT_LINE } from "./legal";
import { HOW_IT_WORKS_STEPS, SITE } from "./site";

export const HOW_IT_WORKS_PATH = "/how-it-works";
export const HOW_IT_WORKS_NAV = "How it works";
export const HOW_IT_WORKS_TITLE = "How it works";
export const HOW_IT_WORKS_DOCUMENT_TITLE = `${HOW_IT_WORKS_TITLE} — ${SITE.name}`;
export const HOW_IT_WORKS_UPDATED = "Updated August 22, 2026";

export const HOW_IT_WORKS_LEAD = SITE.deck;
export const HOW_IT_WORKS_LOOP =
  "Join → Bid → Rank → Share → Get Outbid → Bid Again.";

export const HOW_IT_WORKS_TAB_LINE = BOARD_TABS.map((tab) => tab.label).join(
  ", ",
);

export const HOW_IT_WORKS_MONEY = [
  { value: "$2", label: "to enter" },
  { value: "+$2", label: "to overtake" },
] as const;

export const HOW_IT_WORKS_BEATS = [
  {
    title: HOW_IT_WORKS_STEPS[0],
    body: "That’s the join. No paste URL. We only keep the name, photo, and headline you approve.",
  },
  {
    title: HOW_IT_WORKS_STEPS[1],
    body: `Edit anything before you bid. Pick up to ${MAX_CATEGORIES} industries so you also show on those tabs.`,
  },
  {
    title: HOW_IT_WORKS_STEPS[2],
    body: "$2 gets you on the board. To take a rank, pay that listing’s bid plus $2. Stripe Checkout is the only bid that counts.",
  },
  {
    title: HOW_IT_WORKS_STEPS[3],
    body: "Post your number. People looking for someone to work with start at #1. Your LinkedIn and site take the clicks.",
  },
] as const;

export type HowItWorksBlock = {
  heading: string;
  paragraphs: string[];
};

export const HOW_IT_WORKS_SECTIONS: readonly HowItWorksBlock[] = [
  {
    heading: "The money",
    paragraphs: [
      "$2 to enter. +$2 to overtake the rank above you. Next rank = qualifying bid + $2.",
      "Pay less than #1 and you still land wherever that number sits. Stripe Checkout is the only way a bid counts. A pending checkout does not move the board.",
    ],
  },
  {
    heading: "Outbid",
    paragraphs: [
      "If someone pays more, you fall down the board. You are not deleted. Bid again if you want the spot back.",
      "Bids are not refunded because someone passed you.",
    ],
  },
  {
    heading: "What rank means",
    paragraphs: [
      "Money buys placement, not quality. A higher rank is purchased attention. It is not a competence score.",
    ],
  },
  {
    heading: "The board",
    paragraphs: [
      `One leaderboard. Eight tabs: ${HOW_IT_WORKS_TAB_LINE}.`,
      "Clicks are the LinkedIn icon and the site icon. Those go to you. Rank, photo, name, headline, bid, and industry are public. That is the product.",
    ],
  },
];

export const HOW_IT_WORKS_FAQ: readonly HowItWorksBlock[] = [
  {
    heading: "Is this LinkedIn?",
    paragraphs: [
      "No. It is a paid placement leaderboard. Sign in with LinkedIn is how you join. We don’t scrape LinkedIn.",
    ],
  },
  {
    heading: "Do I disappear if I get outbid?",
    paragraphs: [
      "No. Outbid moves you down. It does not remove the listing.",
    ],
  },
  {
    heading: "Does #1 mean I’m the best?",
    paragraphs: [
      "No. #1 means you paid the most right now.",
    ],
  },
  {
    heading: "Can I get a refund if someone passes me?",
    paragraphs: [
      "No. You paid for the rank you held. Stripe handles failed or disputed charges.",
    ],
  },
  {
    heading: "How do people reach me?",
    paragraphs: [
      "They click the LinkedIn icon or the site icon on your row. We do not run a job board, inbox, or recruiter CRM.",
    ],
  },
];

export const HOW_IT_WORKS_CONTACT: HowItWorksBlock = {
  heading: "Contact",
  paragraphs: [CONTACT_LINE],
};
