import { describe, expect, it } from "vitest";
import {
  HSTS_HEADER,
  httpsRedirect,
  isPublicSiteHost,
  withHsts,
} from "../src/lib/https";

describe("HTTP → HTTPS + HSTS", () => {
  it("301s apex and www HTTP to the same HTTPS path", () => {
    const apex = httpsRedirect(new Request("http://workwithme.lol/join"));
    expect(apex?.status).toBe(301);
    expect(apex?.headers.get("Location")).toBe("https://workwithme.lol/join");
    expect(apex?.headers.get("Strict-Transport-Security")).toBe(HSTS_HEADER);

    const www = httpsRedirect(new Request("http://www.workwithme.lol/"));
    expect(www?.status).toBe(301);
    expect(www?.headers.get("Location")).toBe("https://www.workwithme.lol/");
  });

  it("does not bounce localhost, workers.dev, or HTTPS", () => {
    expect(httpsRedirect(new Request("http://localhost:5173/"))).toBeNull();
    expect(
      httpsRedirect(new Request("http://workwithme-lol.tcrxx0.workers.dev/")),
    ).toBeNull();
    expect(httpsRedirect(new Request("https://workwithme.lol/"))).toBeNull();
  });

  it("sets HSTS on public HTTPS responses", () => {
    expect(isPublicSiteHost("workwithme.lol")).toBe(true);
    const stamped = withHsts(
      new Response("ok"),
      new Request("https://workwithme.lol/"),
    );
    expect(stamped.headers.get("Strict-Transport-Security")).toBe(HSTS_HEADER);
    const local = withHsts(
      new Response("ok"),
      new Request("http://localhost:5173/"),
    );
    expect(local.headers.get("Strict-Transport-Security")).toBeNull();
  });
});
