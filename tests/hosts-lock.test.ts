import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("custom domains", () => {
  it("attaches apex and www to the same Worker and never hireme.lol", () => {
    const wrangler = readFileSync("wrangler.jsonc", "utf8");
    expect(wrangler).toContain('"pattern": "workwithme.lol"');
    expect(wrangler).toContain('"pattern": "www.workwithme.lol"');
    expect(wrangler).toContain('"custom_domain": true');
    expect(wrangler).not.toMatch(/"pattern": "hireme\.lol"/);
  });
});
