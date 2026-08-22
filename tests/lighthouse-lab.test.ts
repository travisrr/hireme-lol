import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ROBOTS_TXT } from "../src/lib/robots";
import { FOUNDING_HEADSHOT_KEYS } from "../src/lib/media";

describe("Lighthouse lab lock", () => {
  it("self-hosts and preloads Plus Jakarta, no remote font CSS", () => {
    const html = readFileSync("index.html", "utf8");
    expect(html).toContain('href="/fonts/plus-jakarta-sans-latin-wght.woff2"');
    expect(html).toContain('rel="preload"');
    expect(html).toContain('as="font"');
    expect(html).not.toContain("fonts.googleapis.com");
    expect(html).not.toContain("fonts.gstatic.com");
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toContain("@font-face");
    expect(css).toContain("/fonts/plus-jakarta-sans-latin-wght.woff2");
    expect(
      existsSync("public/fonts/plus-jakarta-sans-latin-wght.woff2"),
    ).toBe(true);
    const bytes = readFileSync("public/fonts/plus-jakarta-sans-latin-wght.woff2");
    expect(bytes.subarray(0, 4).toString()).toBe("wOF2");
  });

  it("ships a real robots.txt that allows crawlers and has no sitemap", () => {
    const robots = readFileSync("public/robots.txt", "utf8");
    expect(robots).toBe(ROBOTS_TXT);
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).not.toMatch(/sitemap/i);
    expect(existsSync("public/sitemap.xml")).toBe(false);
    const worker = readFileSync("worker/index.ts", "utf8");
    expect(worker).toContain('url.pathname === "/robots.txt"');
  });

  it("points founding portraits at 80px WebP keys", () => {
    expect(FOUNDING_HEADSHOT_KEYS.elon).toBe("photos/founding-elon.webp");
    expect(FOUNDING_HEADSHOT_KEYS.palmer).toBe("photos/founding-palmer.webp");
    expect(FOUNDING_HEADSHOT_KEYS.jensen).toBe("photos/founding-jensen.webp");
    const migration = readFileSync("migrations/0016_founding_webp.sql", "utf8");
    expect(migration).toContain("photos/founding-elon.webp");
    expect(migration).toContain("photos/founding-palmer.webp");
    expect(migration).toContain("photos/founding-jensen.webp");
  });

  it("splits off-home routes and leaves the Insights beacon alone", () => {
    const app = readFileSync("src/App.tsx", "utf8");
    expect(app).toContain('import("./pages/JoinPage")');
    expect(app).toContain('import("./pages/LegalPage")');
    expect(app).toContain("lazy(");
    expect(app).toContain("HomePage");
    expect(app).not.toMatch(/lazy\(\s*\(\)\s*=>\s*import\("\.\/pages\/HomePage"\)/);
    const beacon = readFileSync("src/lib/web-analytics.ts", "utf8");
    expect(beacon).toContain("static.cloudflareinsights.com/beacon.min.js");
    expect(beacon).toContain("CF_WEB_ANALYTICS_TOKEN");
  });

  it("keeps packed OG tags and the 40 r12 tile", () => {
    const html = readFileSync("index.html", "utf8");
    expect(html).toContain('content="https://workwithme.lol/og.png"');
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(/--photo:\s*40px/);
    expect(css).toMatch(/--row-min:\s*56px/);
  });
});
