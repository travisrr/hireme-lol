import { hmacSha256Hex, timingSafeEqual } from "./crypto";

export function parseStripeSignatureHeader(header: string): { timestamp: string; signatures: string[] } | null {
  const parts = header.split(",").map((part) => part.trim());
  let timestamp = "";
  const signatures: string[] = [];
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (!key || !value) {
      continue;
    }
    if (key === "t") {
      timestamp = value;
    }
    if (key === "v1") {
      signatures.push(value);
    }
  }
  if (!timestamp || signatures.length === 0) {
    return null;
  }
  return { timestamp, signatures };
}

export async function signStripePayload(
  secret: string,
  timestamp: string,
  payload: string,
): Promise<string> {
  return hmacSha256Hex(secret, `${timestamp}.${payload}`);
}

export function formatStripeSignatureHeader(timestamp: string, signature: string): string {
  return `t=${timestamp},v1=${signature}`;
}

export async function verifyStripeSignature(opts: {
  secret: string;
  header: string;
  payload: string;
}): Promise<boolean> {
  const parsed = parseStripeSignatureHeader(opts.header);
  if (!parsed) {
    return false;
  }
  const expected = await signStripePayload(opts.secret, parsed.timestamp, opts.payload);
  return parsed.signatures.some((signature) => timingSafeEqual(signature, expected));
}
