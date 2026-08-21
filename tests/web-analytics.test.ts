import { describe, expect, it } from "vitest";
import {
  injectWebAnalyticsBeacon,
  resolveBeaconToken,
} from "../src/lib/web-analytics";

describe("Cloudflare Web Analytics beacon", () => {
  it("prefers CF_WEB_ANALYTICS_TOKEN and falls back to CF_BEACON_TOKEN", () => {
    expect(resolveBeaconToken({})).toBeUndefined();
    expect(resolveBeaconToken({ CF_WEB_ANALYTICS_TOKEN: "   " })).toBeUndefined();
    expect(resolveBeaconToken({ CF_BEACON_TOKEN: "alias_token" })).toBe(
      "alias_token",
    );
    expect(
      resolveBeaconToken({
        CF_WEB_ANALYTICS_TOKEN: "preferred",
        CF_BEACON_TOKEN: "alias_token",
      }),
    ).toBe("preferred");
  });

  it("injects the docu-coach JS snippet and skips when the token is empty", () => {
    const html = "<html><body><div id='root'></div></body></html>";
    expect(injectWebAnalyticsBeacon(html, "")).toBe(html);

    const withBeacon = injectWebAnalyticsBeacon(html, "site_token_1");
    expect(withBeacon).toContain(
      `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"site_token_1"}'></script>`,
    );
    expect(withBeacon).not.toMatch(/google-analytics|gtag|GTM-|clarity/i);

    expect(injectWebAnalyticsBeacon(withBeacon, "other")).toBe(withBeacon);
  });
});
