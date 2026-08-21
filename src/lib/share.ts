import { SITE } from "./site";

export function shareLine(rank: number): string {
  return `I'm #${rank} on ${SITE.name}. Think I deserve to be lower?`;
}

export function linkedinShareIntent(text: string): string {
  return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
}
