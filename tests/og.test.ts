import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function pngSize(path: string): { width: number; height: number } {
  const buf = readFileSync(path);
  expect(buf.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(
    true,
  );
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe("share card", () => {
  it("locks short OG tags on every page", () => {
    const html = readFileSync("index.html", "utf8");
    expect(html).toContain('<meta property="og:title" content="workwithme.lol" />');
    expect(html).toContain('<meta property="og:description" content="Bid for #1." />');
    expect(html).toContain(
      '<meta property="og:image" content="https://workwithme.lol/og.png" />',
    );
    expect(html).toContain('<meta property="og:image:width" content="1200" />');
    expect(html).toContain('<meta property="og:image:height" content="630" />');
    expect(html).toContain('<meta property="og:url" content="https://workwithme.lol" />');
    expect(html).toContain('<meta property="og:type" content="website" />');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(html).not.toContain("the professional leaderboard");
    expect(html).not.toContain("$2 to enter");
  });

  it("serves a 1200×630 PNG at /og.png", () => {
    expect(pngSize("public/og.png")).toEqual({ width: 1200, height: 630 });
  });
});
