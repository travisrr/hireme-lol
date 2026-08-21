import type { ReceiptItem } from "../components/ReceiptCard";
import { FOUNDING_HEADSHOT_KEYS } from "./media";
import { publicPhotoSrc } from "./photo";

const PULSE_FILL = 5;

const ELON_PHOTO = publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.elon);
const PALMER_PHOTO = publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.palmer);
const JENSEN_PHOTO = publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.jensen);

export type SeededPulseRow = ReceiptItem & { line: string };

export function pulseClaimLine(
  name: string,
  rank: number,
  amount: string,
  time: string,
): string {
  return `${name} claimed #${rank} · ${amount} · ${time}`;
}

export function pulseJoinedLine(name: string, time: string): string {
  return `${name} joined the board · ${time}`;
}

export function pulseTrendingLine(
  name: string,
  rank: number,
  amount: string,
  time: string,
): string {
  return `${name} · #${rank} · ${amount} · ${time}`;
}

export function seededActivity(): SeededPulseRow[] {
  return [
    {
      id: "seed-act-elon-claim",
      href: "/elon",
      photoUrl: ELON_PHOTO,
      line: pulseClaimLine("Elon Musk", 1, "$6", "2h ago"),
      at: 0,
    },
    {
      id: "seed-act-palmer-claim",
      href: "/palmer",
      photoUrl: PALMER_PHOTO,
      line: pulseClaimLine("Palmer Luckey", 2, "$4", "3h ago"),
      at: 0,
    },
    {
      id: "seed-act-jensen-claim",
      href: "/jensen",
      photoUrl: JENSEN_PHOTO,
      line: pulseClaimLine("Jensen Huang", 3, "$2", "4h ago"),
      at: 0,
    },
    {
      id: "seed-act-palmer-join",
      href: "/palmer",
      photoUrl: PALMER_PHOTO,
      line: pulseJoinedLine("Palmer Luckey", "3h ago"),
      at: 0,
    },
    {
      id: "seed-act-elon-join",
      href: "/elon",
      photoUrl: ELON_PHOTO,
      line: pulseJoinedLine("Elon Musk", "2h ago"),
      at: 0,
    },
  ];
}

export function seededTrending(): SeededPulseRow[] {
  return [
    {
      id: "seed-trend-elon",
      href: "/elon",
      photoUrl: ELON_PHOTO,
      line: pulseTrendingLine("Elon Musk", 1, "$6", "2h ago"),
      at: 0,
    },
    {
      id: "seed-trend-palmer",
      href: "/palmer",
      photoUrl: PALMER_PHOTO,
      line: pulseTrendingLine("Palmer Luckey", 2, "$4", "3h ago"),
      at: 0,
    },
    {
      id: "seed-trend-jensen",
      href: "/jensen",
      photoUrl: JENSEN_PHOTO,
      line: pulseTrendingLine("Jensen Huang", 3, "$2", "4h ago"),
      at: 0,
    },
    {
      id: "seed-trend-elon-repeat",
      href: "/elon",
      photoUrl: ELON_PHOTO,
      line: pulseTrendingLine("Elon Musk", 1, "$6", "2h ago"),
      at: 0,
    },
    {
      id: "seed-trend-palmer-repeat",
      href: "/palmer",
      photoUrl: PALMER_PHOTO,
      line: pulseTrendingLine("Palmer Luckey", 2, "$4", "3h ago"),
      at: 0,
    },
  ];
}

export function fillPulseRows(
  items: readonly ReceiptItem[],
  seed: readonly ReceiptItem[],
): ReceiptItem[] {
  const rows: ReceiptItem[] = items.slice(0, PULSE_FILL);
  for (const extra of seed) {
    if (rows.length >= PULSE_FILL) break;
    if (rows.some((row) => row.id === extra.id || row.line === extra.line)) {
      continue;
    }
    rows.push(extra);
  }
  let index = 0;
  while (rows.length < PULSE_FILL && seed.length > 0) {
    const extra = seed[index % seed.length];
    rows.push({ ...extra, id: `${extra.id}-pad-${rows.length}` });
    index += 1;
  }
  return rows;
}
