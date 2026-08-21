import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const BASE = process.env.LOCK_SHOT_ORIGIN || "http://127.0.0.1:5173";
const OUT_REPO = "lock-shots";
const OUT_ART = "/opt/cursor/artifacts/screenshots";

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

async function ready(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

async function writeShot(page, name, clip) {
  const paths = [`${OUT_REPO}/${name}.png`, `${OUT_ART}/${name}.png`];
  for (const path of paths) {
    await page.screenshot({ path, clip, animations: "disabled" });
  }
}

async function main() {
  await mkdir(OUT_REPO, { recursive: true });
  await mkdir(OUT_ART, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({
        viewport,
        deviceScaleFactor: 2,
      });
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
      await ready(page);
      const headerHero = await page.evaluate(() => {
        const header = document.querySelector("header");
        const hero = document.querySelector('[data-lock="header-hero"]');
        if (!header || !hero) return null;
        const a = header.getBoundingClientRect();
        const b = hero.getBoundingClientRect();
        return {
          x: 0,
          y: 0,
          width: Math.min(viewport.width, Math.ceil(Math.max(a.right, b.right))),
          height: Math.min(viewport.height, Math.ceil(b.bottom)),
        };
      });
      if (headerHero) {
        await writeShot(page, `ui-${viewport.width}-header-hero`, headerHero);
      }
      await page.goto(`${BASE}/?tab=healthcare`, {
        waitUntil: "domcontentloaded",
      });
      await ready(page);
      const board = page.locator('[data-lock="board-tabs"]').first();
      await board.waitFor({ state: "visible" });
      await board.screenshot({
        path: `${OUT_REPO}/ui-${viewport.width}-board-tabs.png`,
        animations: "disabled",
      });
      await board.screenshot({
        path: `${OUT_ART}/ui-${viewport.width}-board-tabs.png`,
        animations: "disabled",
      });
      await page.goto(`${BASE}/join`, { waitUntil: "domcontentloaded" });
      await ready(page);
      await page.locator('[data-lock="join-sheet"]').first().screenshot({
        path: `${OUT_REPO}/ui-${viewport.width}-join-sheet.png`,
        animations: "disabled",
      });
      await page.locator('[data-lock="join-sheet"]').first().screenshot({
        path: `${OUT_ART}/ui-${viewport.width}-join-sheet.png`,
        animations: "disabled",
      });
      await page.goto(`${BASE}/how-it-works`, { waitUntil: "domcontentloaded" });
      await ready(page);
      const how = await page.evaluate(() => {
        const header = document.querySelector("header");
        const main = document.querySelector('[data-lock="how-it-works"]');
        if (!header || !main) return null;
        const a = header.getBoundingClientRect();
        const b = main.getBoundingClientRect();
        return {
          x: 0,
          y: 0,
          width: Math.min(viewport.width, Math.ceil(Math.max(a.right, b.right))),
          height: Math.min(viewport.height, Math.ceil(b.bottom + 16)),
        };
      });
      if (how) await writeShot(page, `ui-${viewport.width}-how-it-works`, how);
      await page.goto(`${BASE}/join?share=1&rank=4`, {
        waitUntil: "domcontentloaded",
      });
      await ready(page);
      await page.locator('[data-lock="share-sheet"]').first().screenshot({
        path: `${OUT_REPO}/ui-${viewport.width}-share.png`,
        animations: "disabled",
      });
      await page.locator('[data-lock="share-sheet"]').first().screenshot({
        path: `${OUT_ART}/ui-${viewport.width}-share.png`,
        animations: "disabled",
      });
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

await main();
