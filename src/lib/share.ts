import { SITE } from "./site";

export function shareLine(rank: number): string {
  return `I'm #${rank} on ${SITE.name}. Think I deserve to be lower?`;
}

export function linkedinShareIntent(text: string): string {
  return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
}

export function xShareIntent(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function facebookShareIntent(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function threadsShareIntent(text: string): string {
  return `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`;
}
