import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CONTACT_EMAIL } from "../lib/legal";
import { formatUsdFromCents } from "../lib/money";
import { claimPriceForRank, minBidToEnter } from "../lib/ranking";
import {
  claimPriceTipBody,
  claimPriceTipLead,
  SITE,
} from "../lib/site";
import type { BidEconomics, ListingForRank } from "../lib/types";
import { JoinQr } from "./JoinQr";

type ClaimHeadlineProps = {
  board: readonly ListingForRank[];
  economics: BidEconomics;
};

export function ClaimHeadline({ board, economics }: ClaimHeadlineProps) {
  const claim = claimPriceForRank(board, 1, economics);
  const amount = formatUsdFromCents(claim);
  const entry = formatUsdFromCents(minBidToEnter(economics));
  const increment = formatUsdFromCents(economics.minIncrementCents);

  return (
    <section className="hero-claim">
      <p className="type-claim text-ink">{SITE.tagline}</p>
      <h1 className="type-claim text-ink">
        Claim #1 for{" "}
        <ClaimPriceTip amount={amount} increment={increment} />
      </h1>
      <p className="hero-claim-why text-mute">{SITE.claimWhy}</p>
      <div className="hero-claim-cta">
        <Link to="/join" className="btn-hero w-fit no-underline">
          {SITE.outbid}
        </Link>
        <JoinQr />
        <aside data-lock="hero-sponsor" className="hero-sponsor">
          <p className="hero-sponsor-title">{SITE.sponsorTitle}</p>
          <p className="hero-sponsor-why">
            {SITE.sponsorWhy}{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Sponsor workwithme.lol")}`}
              className="hero-sponsor-mail"
            >
              {SITE.sponsorCta}
            </a>
          </p>
        </aside>
      </div>
      <p className="type-body hero-claim-help text-mute">
        {entry} to enter. +{increment} to overtake.
      </p>
    </section>
  );
}

function canHover(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function ClaimPriceTip({
  amount,
  increment,
}: {
  amount: string;
  increment: string;
}) {
  const tipId = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className={open ? "claim-price-tip is-open" : "claim-price-tip"}
      onMouseEnter={() => {
        if (canHover()) setOpen(true);
      }}
      onMouseLeave={() => {
        if (canHover()) setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="claim-price-btn type-price text-accent"
        aria-expanded={open}
        aria-controls={tipId}
        onFocus={() => {
          if (canHover()) setOpen(true);
        }}
        onClick={() => {
          if (!canHover()) setOpen((value) => !value);
        }}
      >
        {amount}
      </button>
      <span id={tipId} role="tooltip" className="claim-price-note">
        <strong className="claim-price-note-lead">
          {claimPriceTipLead(amount)}
        </strong>
        <span className="claim-price-note-why">{SITE.claimPriceTipWhy}</span>
        <span className="claim-price-note-body">
          {claimPriceTipBody(increment)}
        </span>
      </span>
    </span>
  );
}
