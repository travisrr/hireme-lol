const NOT_A_JOB =
  /^(founding member|founding bid\.?)$/i;

export const SEED_JOB_TITLES = {
  elon: "CEO at Tesla, SpaceX, and xAI",
  palmer: "Founder at Anduril",
  jensen: "President and CEO at NVIDIA",
  maya: "Partner at Sequoia Capital",
  noah: "Staff Software Engineer at Stripe",
} as const;

export function jobHeadline(
  raw: string | null | undefined,
): string {
  const text = raw?.trim() ?? "";
  if (!text || NOT_A_JOB.test(text)) return "";
  return text;
}
