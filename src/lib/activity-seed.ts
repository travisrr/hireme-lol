import type { ActivityRow } from "../server/store";

const PULSE_FILL = 5;
const HOUR = 60 * 60 * 1000;

/** Five named Activity rows for /api/board. Seed is allowed. Empty is a fail. */
export function seededBoardActivity(now = Date.now()): ActivityRow[] {
  return [
    {
      id: "seed-act-elon-claim",
      type: "bid_confirmed",
      handle: "elon",
      displayName: "Elon Musk",
      amountCents: 600,
      rankAfter: 1,
      createdAt: now - 2 * HOUR,
    },
    {
      id: "seed-act-palmer-claim",
      type: "bid_confirmed",
      handle: "palmer",
      displayName: "Palmer Luckey",
      amountCents: 400,
      rankAfter: 2,
      createdAt: now - 3 * HOUR,
    },
    {
      id: "seed-act-jensen-claim",
      type: "bid_confirmed",
      handle: "jensen",
      displayName: "Jensen Huang",
      amountCents: 200,
      rankAfter: 3,
      createdAt: now - 4 * HOUR,
    },
    {
      id: "seed-act-palmer-join",
      type: "joined",
      handle: "palmer",
      displayName: "Palmer Luckey",
      amountCents: null,
      rankAfter: null,
      createdAt: now - 3 * HOUR,
    },
    {
      id: "seed-act-elon-join",
      type: "joined",
      handle: "elon",
      displayName: "Elon Musk",
      amountCents: null,
      rankAfter: null,
      createdAt: now - 2 * HOUR,
    },
  ];
}

export function boardActivityOrSeed(rows: readonly ActivityRow[]): ActivityRow[] {
  if (rows.length >= PULSE_FILL) return rows.slice(0, 20);
  return seededBoardActivity();
}
