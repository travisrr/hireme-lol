import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  oppositeTheme,
  parseTheme,
  THEME_STORAGE_KEY,
} from "../src/lib/theme";

describe("dark mode", () => {
  it("parses stored light and dark and flips them", () => {
    expect(THEME_STORAGE_KEY).toBe("workwithme-theme");
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
    expect(parseTheme("system")).toBe(null);
    expect(parseTheme("")).toBe(null);
    expect(oppositeTheme("light")).toBe("dark");
    expect(oppositeTheme("dark")).toBe("light");
  });

  it("boots from localStorage before paint and paints dark tokens", () => {
    const html = readFileSync("index.html", "utf8");
    expect(html).toContain('content="light dark"');
    expect(html).toContain(THEME_STORAGE_KEY);
    expect(html).toContain('setAttribute("data-theme", theme)');
    expect(html).toContain("prefers-color-scheme: dark");
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(/:root\[data-theme="dark"\] \{[\s\S]*?--color-paper: #121110;/);
    expect(css).toMatch(/:root\[data-theme="dark"\] \{[\s\S]*?--color-ink: #f3efe6;/);
    expect(css).toMatch(/:root\[data-theme="dark"\] \{[\s\S]*?--color-card: #1c1b18;/);
    expect(css).toContain("color-scheme: light");
    expect(css).toContain("color-scheme: dark");
  });

  it("puts a 36px toggle left of the header CTA and on join", () => {
    const header = readFileSync("src/components/SiteHeader.tsx", "utf8");
    const termsAt = header.indexOf('to="/terms"');
    const toggleAt = header.indexOf("<ThemeToggle />");
    const ctaAt = header.indexOf("btn-header");
    expect(header).toContain("HOW_IT_WORKS_NAV");
    expect(toggleAt).toBeGreaterThan(termsAt);
    expect(ctaAt).toBeGreaterThan(toggleAt);
    const join = readFileSync("src/pages/JoinPage.tsx", "utf8");
    expect(join).toContain("join-top");
    expect(join).toContain("<ThemeToggle />");
    const boot = readFileSync("src/main.tsx", "utf8");
    expect(boot).toContain("ThemeProvider");
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(/\.theme-toggle \{[\s\S]*?width: 36px;[\s\S]*?height: 36px;/);
    expect(css).toMatch(/\.header-legal \{[\s\S]*?font-size: 13px;/);
    expect(css).toMatch(
      /@media \(max-width: 767px\) \{[\s\S]*?\.header-legal \{[\s\S]*?display: none;/,
    );
  });

  it("keeps the LinkedIn QR dark on white so it still scans", () => {
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toMatch(
      /\.hero-join-qr \{[\s\S]*?background: #ffffff;[\s\S]*?color: #1d2226;/,
    );
  });
});
