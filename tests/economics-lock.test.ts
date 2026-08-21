import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LAUNCH_ECONOMICS } from "../src/lib/types";

const FORBIDDEN = [
  "$5 to enter",
  "+$1 to overtake",
  "minEntryCents: 500",
  "minIncrementCents: 100",
  "('min_entry_cents', '500'",
  "('min_increment_cents', '100'",
];

const DOCS = [
  "PRODUCT.md",
  "ARCHITECTURE.md",
  "README.md",
  "src/lib/types.ts",
  "migrations/0001_init.sql",
  "migrations/0002_launch_economics.sql",
];

describe("hard lock $2 / +$2", () => {
  it("keeps launch defaults at 200 / 200 cents", () => {
    expect(LAUNCH_ECONOMICS).toEqual({
      minEntryCents: 200,
      minIncrementCents: 200,
    });
  });

  it("does not leave $5 / +$1 in docs, defaults, or D1 seed", () => {
    for (const path of DOCS) {
      const text = readFileSync(path, "utf8");
      for (const needle of FORBIDDEN) {
        expect(text, `${path} contains ${needle}`).not.toContain(needle);
      }
    }
  });

  it("states $2 to enter and +$2 to overtake in product copy", () => {
    const product = readFileSync("PRODUCT.md", "utf8");
    expect(product).toContain("$2 to enter");
    expect(product).toContain("+$2 to overtake");
    expect(product).toContain("Next rank = qualifying bid + $2");
  });
});
