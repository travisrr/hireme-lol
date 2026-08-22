import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CONTACT_EMAIL } from "../src/lib/legal";
import { formatUsdFromCents } from "../src/lib/money";
import {
  claimPriceTipBody,
  claimPriceTipLead,
  SITE,
} from "../src/lib/site";
import { DEFAULT_ECONOMICS } from "../src/lib/types";

describe("hero claim price tooltip", () => {
  it("asks if the live #1 price is too high, then explains why it isn’t", () => {
    expect(claimPriceTipLead("$12")).toBe(
      "So you think $12 is too high to spend?",
    );
    expect(SITE.claimPriceTipWhy).toBe("Here’s why it isn’t.");
    expect(
      claimPriceTipBody(
        formatUsdFromCents(DEFAULT_ECONOMICS.minIncrementCents),
      ),
    ).toBe(
      "That’s the live number to take #1 — whoever is on top plus $2. A recruiter wants a cut of your next salary. LinkedIn ads spend this before lunch. People looking for someone to work with start at #1. Your LinkedIn and site take the clicks.",
    );
  });

  it("hangs the note off the hero price with hover and tap", () => {
    const headline = readFileSync("src/components/ClaimHeadline.tsx", "utf8");
    expect(headline).toContain("ClaimPriceTip");
    expect(headline).toContain("claim-price-tip");
    expect(headline).toContain("claimPriceTipLead");
    expect(headline).toContain("SITE.claimPriceTipWhy");
    expect(headline).toContain("claimPriceTipBody");
    expect(headline).toContain('role="tooltip"');
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(
      /\.claim-price-btn \{[\s\S]*?text-decoration-style: dotted;/,
    );
    expect(css).toMatch(
      /\.claim-price-tip\.is-open \.claim-price-note,[\s\S]*?opacity: 1;/,
    );
    expect(css).toMatch(
      /\.claim-price-note \{[\s\S]*?border-radius: 12px;[\s\S]*?background: var\(--color-card\);/,
    );
  });
});

describe("hero sponsor callout", () => {
  it("sits to the right of the join QR and mails hello@workwithme.lol", () => {
    expect(SITE.sponsorTitle).toBe("Sponsor the site");
    expect(SITE.sponsorWhy).toBe(
      "Put your brand on the board people pay to be seen on.",
    );
    expect(SITE.sponsorCta).toBe("Talk to us");
    expect(CONTACT_EMAIL).toBe("hello@workwithme.lol");
    const headline = readFileSync("src/components/ClaimHeadline.tsx", "utf8");
    expect(headline).toContain("<JoinQr />");
    expect(headline.indexOf("<JoinQr />")).toBeLessThan(
      headline.indexOf("hero-sponsor"),
    );
    expect(headline).toContain("CONTACT_EMAIL");
    expect(headline).toContain("mailto:${CONTACT_EMAIL}");
    expect(headline).toContain("{SITE.sponsorTitle}");
    expect(headline).toContain("{SITE.sponsorWhy}");
    expect(headline).toContain("{SITE.sponsorCta}");
    expect(headline).not.toMatch(/hireme\.lol/);
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(
      /\.hero-sponsor \{[\s\S]*?border-radius: 12px;[\s\S]*?background: var\(--color-card\);[\s\S]*?opacity: 1;/,
    );
    expect(css).toMatch(
      /\.hero-claim-cta \{[\s\S]*?display: flex;[\s\S]*?align-items: center;[\s\S]*?flex-wrap: wrap;[\s\S]*?gap: 12px;/,
    );
  });
});
