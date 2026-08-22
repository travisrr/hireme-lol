import type { ReceiptItem } from "../components/ReceiptCard";
import { FOUNDING_HEADSHOT_KEYS } from "./media";
import { publicPhotoSrc } from "./photo";

const PULSE_FILL = 5;

const ELON_PHOTO = publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.elon);
const PALMER_PHOTO = publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.palmer);
const JENSEN_PHOTO = publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.jensen);
const MAYA_PHOTO = "/lock-shots/maya.jpg";
const NOAH_PHOTO = "/lock-shots/noah.jpg";

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
      name: "Elon Musk",
      rank: 1,
      amount: "$6",
      time: "2h ago",
      at: 0,
    },
    {
      id: "seed-trend-palmer",
      href: "/palmer",
      photoUrl: PALMER_PHOTO,
      line: pulseTrendingLine("Palmer Luckey", 2, "$4", "3h ago"),
      name: "Palmer Luckey",
      rank: 2,
      amount: "$4",
      time: "3h ago",
      at: 0,
    },
    {
      id: "seed-trend-jensen",
      href: "/jensen",
      photoUrl: JENSEN_PHOTO,
      line: pulseTrendingLine("Jensen Huang", 3, "$2", "4h ago"),
      name: "Jensen Huang",
      rank: 3,
      amount: "$2",
      time: "4h ago",
      at: 0,
    },
    {
      id: "seed-trend-maya",
      href: "/maya",
      photoUrl: MAYA_PHOTO,
      line: pulseTrendingLine("Maya Chen", 4, "$2", "5h ago"),
      name: "Maya Chen",
      rank: 4,
      amount: "$2",
      time: "5h ago",
      at: 0,
    },
    {
      id: "seed-trend-noah",
      href: "/noah",
      photoUrl: NOAH_PHOTO,
      line: pulseTrendingLine("Noah Okonkwo", 5, "$2", "6h ago"),
      name: "Noah Okonkwo",
      rank: 5,
      amount: "$2",
      time: "6h ago",
      at: 0,
    },
  ];
}

function pulsePersonKey(item: ReceiptItem): string {
  if (item.href) return item.href;
  return item.line.split("·")[0]?.trim().toLowerCase() || item.id;
}

export function fillPulseRows(
  items: readonly ReceiptItem[],
  seed: readonly ReceiptItem[],
): ReceiptItem[] {
  const rows: ReceiptItem[] = items.slice(0, PULSE_FILL);
  for (const extra of seed) {
    if (rows.length >= PULSE_FILL) break;
    if (rows.some((row) => row.id === extra.id)) continue;
    rows.push(extra);
  }
  return rows;
}

export function fillUniquePeople(
  items: readonly ReceiptItem[],
  seed: readonly ReceiptItem[],
): ReceiptItem[] {
  const rows: ReceiptItem[] = [];
  const seen = new Set<string>();
  for (const item of [...items, ...seed]) {
    if (rows.length >= PULSE_FILL) break;
    const key = pulsePersonKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(item);
  }
  return rows;
}
