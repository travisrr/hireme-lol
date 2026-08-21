import { hmacSha256Hex, timingSafeEqual } from "./crypto";

export async function verifyPaddleSignature(input: {
  payload: string;
  header: string;
  secret: string;
  nowMs?: number;
  toleranceSec?: number;
}): Promise<boolean> {
  const nowMs = input.nowMs ?? Date.now();
  const toleranceSec = input.toleranceSec ?? 300;
  const parts: Record<string, string> = {};
  for (const piece of input.header.split(";")) {
    const [key, ...rest] = piece.split("=");
    if (!key) continue;
    parts[key.trim()] = rest.join("=").trim();
  }
  const timestamp = parts.ts;
  const signature = parts.h1;
  if (!timestamp || !signature) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(nowMs / 1000 - ts) > toleranceSec) return false;
  const expected = await hmacSha256Hex(input.secret, `${timestamp}:${input.payload}`);
  return timingSafeEqual(expected, signature.toLowerCase());
}

export async function signPaddlePayload(
  secret: string,
  payload: string,
  timestampSec: number,
): Promise<string> {
  const h1 = await hmacSha256Hex(secret, `${timestampSec}:${payload}`);
  return `ts=${timestampSec};h1=${h1}`;
}
