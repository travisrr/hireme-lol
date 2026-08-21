import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const BASE = process.env.LOCK_SHOT_ORIGIN || "http://127.0.0.1:5173";
const OUT = "/opt/cursor/artifacts/screenshots";

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

async function ready(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

async function shot(page, name, selector) {
  const el = page.locator(selector).first();
  await el.waitFor({ state: "visible" });
  await el.screenshot({
    path: `${OUT}/${name}.png`,
    animations: "disabled",
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({
        viewport,
        deviceScaleFactor: 2,
      });
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
      await ready(page);
      await shot(page, `${viewport.width}-header-hero`, '[data-lock="header-hero"]');
      // Include header + hero in one frame
      const headerHero = await page.evaluate(() => {
        const header = document.querySelector("header");
        const hero = document.querySelector('[data-lock="header-hero"]');
        if (!header || !hero) return null;
        const a = header.getBoundingClientRect();
        const b = hero.getBoundingClientRect();
        return {
          x: 0,
          y: 0,
          width: Math.ceil(Math.max(a.right, b.right)),
          height: Math.ceil(b.bottom),
        };
      });
      if (headerHero) {
        await page.screenshot({
          path: `${OUT}/${viewport.width}-header-hero.png`,
          clip: headerHero,
          animations: "disabled",
        });
      }
      await page.locator('[data-lock="board-tabs"]').scrollIntoViewIfNeeded();
      await shot(page, `${viewport.width}-board-tabs`, '[data-lock="board-tabs"]');
      await page.goto(`${BASE}/join`, { waitUntil: "domcontentloaded" });
      await ready(page);
      await shot(page, `${viewport.width}-join-sheet`, '[data-lock="join-sheet"]');
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

await main();
