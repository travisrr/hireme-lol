import type { ReactNode } from "react";
import { recordClick } from "../api/client";
import type { ClickTarget } from "../lib/clicks";

type ClickStatProps = {
  listingId: string;
  linkedinClicks: number;
  websiteClicks: number;
  linkedinUrl: string | null;
  websiteUrl: string | null;
};

export function ClickStat({
  listingId,
  linkedinClicks,
  websiteClicks,
  linkedinUrl,
  websiteUrl,
}: ClickStatProps) {
  return (
    <span className="click-ints">
      <ClickInt
        listingId={listingId}
        target="linkedin"
        count={linkedinClicks}
        href={linkedinUrl}
        label="LinkedIn clicks"
      >
        <LinkedInIntIcon />
      </ClickInt>
      <ClickInt
        listingId={listingId}
        target="site"
        count={websiteClicks}
        href={websiteUrl}
        label="Site clicks"
      >
        <SiteIntIcon />
      </ClickInt>
    </span>
  );
}

function ClickInt({
  listingId,
  target,
  count,
  href,
  label,
  children,
}: {
  listingId: string;
  target: ClickTarget;
  count: number;
  href: string | null;
  label: string;
  children: ReactNode;
}) {
  const inner = (
    <>
      {children}
      <span className="tabular">{count}</span>
    </>
  );

  async function onActivate() {
    try {
      await recordClick(listingId, target);
    } catch {
      // Count is best-effort.
    }
  }

  if (!href) {
    return (
      <span className="click-int" title={label}>
        {inner}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={label}
      className="click-int"
      onClick={(event) => {
        event.stopPropagation();
        void onActivate();
      }}
    >
      {inner}
    </a>
  );
}

function LinkedInIntIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" aria-hidden="true">
      <rect width="16" height="16" rx="2" fill="currentColor" />
      <path
        fill="#ffffff"
        d="M4.6 6.6h1.5v4.8H4.6V6.6Zm.75-2.4c.48 0 .86.38.86.86 0 .47-.38.85-.86.85a.86.86 0 0 1 0-1.71ZM7.15 6.6h1.42v.66h.02c.2-.38.68-.77 1.4-.77 1.5 0 1.78 1 1.78 2.28v2.63H10.3V9.05c0-.56-.01-1.29-.79-1.29-.78 0-.9.61-.9 1.24v2.4H7.15V6.6Z"
      />
    </svg>
  );
}

function SiteIntIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5 shrink-0 fill-none stroke-current"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="5.25" strokeWidth="1.4" />
      <path d="M2.75 8h10.5" strokeWidth="1.4" />
      <path
        d="M8 2.75c1.7 1.85 1.7 8.65 0 10.5M8 2.75c-1.7 1.85-1.7 8.65 0 10.5"
        strokeWidth="1.4"
      />
    </svg>
  );
}
