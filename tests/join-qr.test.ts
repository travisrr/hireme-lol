import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  JOIN_QR_BORDER,
  JOIN_QR_ECC,
  joinQrMatrix,
  joinQrPath,
  joinQrUrl,
  LINKEDIN_SIGNIN_PATH,
} from "../src/lib/join-qr";
import { linkedinSignInUrl } from "../src/lib/linkedin-oidc";
import { HERO_JOIN_QR, HERO_JOIN_QR_PAD } from "../src/lib/measure";
import { SITE } from "../src/lib/site";

describe("hero LinkedIn join QR", () => {
  it("encodes Sign in with LinkedIn and returns to the bid form", () => {
    expect(SITE.linkedinCta).toBe("Sign in with LinkedIn");
    expect(LINKEDIN_SIGNIN_PATH).toBe("/api/auth/linkedin");
    expect(linkedinSignInUrl(SITE.origin)).toBe(
      "https://workwithme.lol/api/auth/linkedin",
    );
    expect(joinQrUrl()).toBe("https://workwithme.lol/api/auth/linkedin");
    expect(joinQrUrl("https://www.workwithme.lol/")).toBe(
      "https://www.workwithme.lol/api/auth/linkedin",
    );
    const app = readFileSync("src/server/app.ts", "utf8");
    expect(app).toContain('app.get("/api/auth/linkedin"');
    expect(app).toContain("return c.redirect(`${origin}/join?signedin=1`)");
    const join = readFileSync("src/pages/JoinPage.tsx", "utf8");
    expect(join).toContain('href="/api/auth/linkedin"');
    expect(join).toContain("IdentityBidCard");
  });

  it("sits to the right of Outbid on the homepage claim", () => {
    const headline = readFileSync("src/components/ClaimHeadline.tsx", "utf8");
    expect(headline).toContain("hero-claim-cta");
    expect(headline).toContain("{SITE.outbid}");
    expect(headline).toContain("<JoinQr />");
    const qr = readFileSync("src/components/JoinQr.tsx", "utf8");
    expect(qr).toContain("hero-join-qr");
    expect(qr).toContain("joinQrUrl()");
    expect(qr).toContain("LINKEDIN_SIGNIN_PATH");
    expect(qr).toContain("SITE.linkedinCta");
    expect(HERO_JOIN_QR).toBe(80);
    expect(HERO_JOIN_QR_PAD).toBe(8);
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(
      /\.hero-claim-cta \{[\s\S]*?display: flex;[\s\S]*?align-items: center;[\s\S]*?gap: 12px;/,
    );
    expect(css).toMatch(
      /\.hero-join-qr \{[\s\S]*?width: 80px;[\s\S]*?height: 80px;[\s\S]*?padding: 8px;[\s\S]*?border-radius: 12px;/,
    );
    expect(css).toMatch(
      /@media \(min-width: 768px\) \{[\s\S]*?\.hero-join-qr \{[\s\S]*?display: block;/,
    );
  });

  it("renders a scannable matrix for the production LinkedIn sign-in URL", () => {
    const qr = joinQrMatrix(joinQrUrl());
    expect(JOIN_QR_ECC).toBe("M");
    expect(JOIN_QR_BORDER).toBe(2);
    expect(qr.size).toBeGreaterThan(20);
    expect(qr.data).toHaveLength(qr.size);
    expect(qr.data.every((row) => row.length === qr.size)).toBe(true);
    expect(qr.data.some((row) => row.some(Boolean))).toBe(true);
    expect(joinQrPath(qr.data).length).toBeGreaterThan(100);
  });
});
