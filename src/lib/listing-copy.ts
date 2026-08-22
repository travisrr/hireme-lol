import { industryLabel, type IndustryId } from "./industries";
import { inferLinkedinTitle } from "./linkedin-title";

const PLACEHOLDER_PITCH = /^(founding member|founding bid\.?)$/i;

export function listingPitch(
  pitch?: string | null,
  headline?: string | null,
): string {
  const text = inferLinkedinTitle(pitch || headline);
  if (!text || PLACEHOLDER_PITCH.test(text)) return "";
  return text;
}

export function listingIndustry(
  industry?: IndustryId | null,
  categories: readonly IndustryId[] = [],
): string {
  const id = industry ?? categories[0] ?? null;
  return id ? industryLabel(id) : "";
}

export function listingCopy(input: {
  industry?: IndustryId | null;
  categories?: readonly IndustryId[];
  pitch?: string | null;
  headline?: string | null;
}): string {
  const industry = listingIndustry(input.industry, input.categories ?? []);
  const pitch = listingPitch(input.pitch, input.headline);
  if (industry && pitch) return `${industry} · ${pitch}`;
  return industry || pitch;
}
