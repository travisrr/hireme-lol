import { describe, expect, it } from "vitest";
import {
  injectWebAnalyticsBeacon,
  resolveBeaconToken,
} from "../src/lib/web-analytics";

describe("Cloudflare Web Analytics beacon", () => {
  it("prefers CF_BEACON_TOKEN and falls back to CF_WEB_ANALYTICS_TOKEN", () => {
    expect(resolveBeaconToken({})).toBeUndefined();
    expect(resolveBeaconToken({ CF_BEACON_TOKEN: "   " })).toBeUndefined();
    expect(resolveBeaconToken({ CF_WEB_ANALYTICS_TOKEN: "legacy_token" })).toBe(
      "legacy_token",
    );
    expect(
      resolveBeaconToken({
        CF_BEACON_TOKEN: "preferred",
        CF_WEB_ANALYTICS_TOKEN: "legacy_token",
      }),
    ).toBe("preferred");
  });

  it("injects the official JS snippet and skips when the token is empty", () => {
    const html = "<html><body><div id='root'></div></body></html>";
    expect(injectWebAnalyticsBeacon(html, "")).toBe(html);

    const withBeacon = injectWebAnalyticsBeacon(html, "site_token_1");
    expect(withBeacon).toContain("<!-- Cloudflare Web Analytics -->");
    expect(withBeacon).toContain("https://static.cloudflareinsights.com/beacon.min.js");
    expect(withBeacon).toContain('data-cf-beacon=\'{"token": "site_token_1"}\'');
    expect(withBeacon).toContain("<!-- End Cloudflare Web Analytics -->");
    expect(withBeacon).not.toMatch(/google-analytics|gtag|GTM-/i);

    expect(injectWebAnalyticsBeacon(withBeacon, "other")).toBe(withBeacon);
  });
});
