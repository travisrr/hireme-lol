import type { ReactNode } from "react";
import { recordClick } from "../api/client";
import type { ClickTarget } from "../lib/clicks";

type ClickStatProps = {
  listingId: string;
  profileViews?: number | null;
  linkedinClicks: number;
  websiteClicks: number;
  linkedinUrl: string | null;
  websiteUrl: string | null;
};

export function ClickStat({
  listingId,
  profileViews = null,
  linkedinClicks,
  websiteClicks,
  linkedinUrl,
  websiteUrl,
}: ClickStatProps) {
  return (
    <span className="click-ints">
      {profileViews != null ? (
        <span className="click-int" title="Profile views">
          <ViewsIntIcon />
          <span className="tabular">{profileViews}</span>
        </span>
      ) : null}
      <ClickInt
        listingId={listingId}
        target="linkedin"
        count={linkedinClicks}
        href={linkedinUrl}
        label="LinkedIn profile"
      >
        <LinkedInIntIcon />
      </ClickInt>
      <ClickInt
        listingId={listingId}
        target="site"
        count={websiteClicks}
        href={websiteUrl}
        label="Website"
      >
        <SiteIntIcon />
      </ClickInt>
    </span>
  );
}

type ProfileOutboundLinksProps = {
  listingId?: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
};

export function ProfileOutboundLinks({
  listingId = null,
  linkedinUrl,
  websiteUrl,
}: ProfileOutboundLinksProps) {
  if (!linkedinUrl && !websiteUrl) return null;
  return (
    <span className="profile-outbounds">
      {linkedinUrl ? (
        <ClickInt
          listingId={listingId}
          target="linkedin"
          href={linkedinUrl}
          label="LinkedIn profile"
        >
          <LinkedInIntIcon className="size-5 shrink-0" />
        </ClickInt>
      ) : null}
      {websiteUrl ? (
        <ClickInt
          listingId={listingId}
          target="site"
          href={websiteUrl}
          label="Website"
        >
          <SiteIntIcon className="size-5 shrink-0 fill-none stroke-current" />
        </ClickInt>
      ) : null}
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
  listingId?: string | null;
  target: ClickTarget;
  count?: number;
  href: string | null;
  label: string;
  children: ReactNode;
}) {
  const inner = (
    <>
      {children}
      {count != null ? <span className="tabular">{count}</span> : null}
    </>
  );

  async function onActivate() {
    if (!listingId) return;
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
      aria-label={label}
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

function ViewsIntIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5 shrink-0 fill-none stroke-current"
      aria-hidden="true"
    >
      <path
        d="M2 8s2.5-4.25 6-4.25S14 8 14 8s-2.5 4.25-6 4.25S2 8 2 8Z"
        strokeWidth="1.4"
      />
      <circle cx="8" cy="8" r="1.75" strokeWidth="1.4" />
    </svg>
  );
}

export function LinkedInIntIcon({
  className = "size-3.5 shrink-0",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <rect width="16" height="16" rx="2" fill="currentColor" />
      <path
        fill="var(--color-card)"
        d="M4.6 6.6h1.5v4.8H4.6V6.6Zm.75-2.4c.48 0 .86.38.86.86 0 .47-.38.85-.86.85a.86.86 0 0 1 0-1.71ZM7.15 6.6h1.42v.66h.02c.2-.38.68-.77 1.4-.77 1.5 0 1.78 1 1.78 2.28v2.63H10.3V9.05c0-.56-.01-1.29-.79-1.29-.78 0-.9.61-.9 1.24v2.4H7.15V6.6Z"
      />
    </svg>
  );
}

export function SiteIntIcon({
  className = "size-3.5 shrink-0 fill-none stroke-current",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="5.25" strokeWidth="1.4" />
      <path d="M2.75 8h10.5" strokeWidth="1.4" />
      <path
        d="M8 2.75c1.7 1.85 1.7 8.65 0 10.5M8 2.75c-1.7 1.85-1.7 8.65 0 10.5"
        strokeWidth="1.4"
      />
    </svg>
  );
}
