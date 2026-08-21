import { hmacSha256Hex, timingSafeEqual } from "./crypto";

export async function verifyStripeSignature(input: {
  payload: string;
  header: string;
  secret: string;
  nowMs?: number;
  toleranceSec?: number;
}): Promise<boolean> {
  const nowMs = input.nowMs ?? Date.now();
  const toleranceSec = input.toleranceSec ?? 300;
  const parts = Object.fromEntries(
    input.header.split(",").map((piece) => {
      const [key, ...rest] = piece.split("=");
      return [key.trim(), rest.join("=")];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(nowMs / 1000 - ts) > toleranceSec) return false;
  const expected = await hmacSha256Hex(input.secret, `${timestamp}.${input.payload}`);
  return timingSafeEqual(expected, signature.toLowerCase());
}

export async function signStripePayload(
  secret: string,
  payload: string,
  timestampSec: number,
): Promise<string> {
  const v1 = await hmacSha256Hex(secret, `${timestampSec}.${payload}`);
  return `t=${timestampSec},v1=${v1}`;
}
