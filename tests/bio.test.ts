import { describe, expect, it } from "vitest";
import { normalizeBio, normalizeCompany } from "../src/lib/bio";

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
});
