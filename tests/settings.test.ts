import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isValidHandle } from "../src/lib/handles";
import {
  SETTINGS_PATH,
  SETTINGS_TITLE,
  settingsJuiceRules,
} from "../src/lib/settings";

describe("bidder settings", () => {
  it("reserves /settings and keeps it off the header chrome", () => {
    expect(SETTINGS_PATH).toBe("/settings");
    expect(SETTINGS_TITLE).toBe("Settings");
    expect(isValidHandle("settings")).toBe(false);
    const app = readFileSync("src/App.tsx", "utf8");
    expect(app).toContain('path="/settings"');
    expect(app).toContain("SettingsPage");
    const header = readFileSync("src/components/SiteHeader.tsx", "utf8");
    expect(header).not.toContain(SETTINGS_PATH);
    const footer = readFileSync("src/components/SiteFooter.tsx", "utf8");
    expect(footer).not.toContain(SETTINGS_PATH);
    const page = readFileSync("src/pages/SettingsPage.tsx", "utf8");
    expect(page).toContain('data-lock="settings"');
    expect(page).toContain("onBioPaste");
    expect(page).toContain("text/plain");
    expect(page).toContain("SETTINGS_JUICE_TITLE");
    expect(page).toContain("SETTINGS_BIO_HINT");
  });

  it("states the fair juice cap in copy", () => {
    expect(settingsJuiceRules(200)).toContain("$0.25");
    expect(settingsJuiceRules(200)).toContain("$1.99");
    expect(settingsJuiceRules(200)).toContain("$2");
    const how = readFileSync("src/lib/how-it-works.ts", "utf8");
    expect(how).toContain("Share juice");
    expect(how).toContain("Same window and cap for every bidder");
  });
});
