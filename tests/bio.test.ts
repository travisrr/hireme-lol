import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { aboutHeading, normalizeBio, normalizeCompany } from "../src/lib/bio";

describe("bio paste", () => {
  it("keeps paragraphs from pasted text and strips tags", () => {
    expect(
      normalizeBio("Line one\r\n\r\nLine two\n\n\nLine three  "),
    ).toBe("Line one\n\nLine two\n\nLine three");
    expect(normalizeBio("<p>Operator.</p>\n<script>x</script>")).toBe(
      "Operator.\nx",
    );
    expect(normalizeCompany("  Acme   Labs  ")).toBe("Acme Labs");
    expect(normalizeCompany("   ")).toBeNull();
  });

  it("labels the public about box with the bidder name", () => {
    expect(aboutHeading("Matt Rhodes")).toBe("About Matt Rhodes");
    expect(aboutHeading("  Matthew   Rhodes ")).toBe("About Matthew Rhodes");
    const profile = readFileSync("src/pages/ProfilePage.tsx", "utf8");
    const css = readFileSync("src/index.css", "utf8");
    expect(profile).toContain("profile-about");
    expect(profile).toContain("{aboutHeading(profile.displayName)}");
    expect(css).toMatch(
      /\.profile-about \{[\s\S]*?border-radius: 12px;[\s\S]*?\.profile-about-title \{[\s\S]*?left: 12px;/,
    );
  });
});
