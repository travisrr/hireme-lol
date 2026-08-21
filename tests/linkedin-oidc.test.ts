import { describe, expect, it } from "vitest";
import {
  linkedinAuthorizeUrl,
  parseLinkedinUserinfo,
  requestHostOrigin,
} from "../src/lib/linkedin-oidc";
import { HOW_IT_WORKS_STEPS } from "../src/lib/site";
import { createApp } from "../src/server/app";
import { MemoryStore } from "../src/server/memory-store";

describe("linkedin oidc", () => {
  it("never invents a headline from userinfo", () => {
    expect(
      parseLinkedinUserinfo({
        name: "Maya Chen",
        picture: "https://media.licdn.com/dms/image/maya.jpg",
        email: "maya@example.com",
      }),
    ).toEqual({
      displayName: "Maya Chen",
      photoUrl: "https://media.licdn.com/dms/image/maya.jpg",
      headline: "",
      email: "maya@example.com",
    });
  });

  it("builds the OIDC authorize URL for openid profile email", () => {
    const url = new URL(
      linkedinAuthorizeUrl({
        clientId: "li_client",
        redirectUri: "https://workwithme.lol/api/auth/linkedin/callback",
        state: "abc",
      }),
    );
    expect(url.origin + url.pathname).toBe(
      "https://www.linkedin.com/oauth/v2/authorization",
    );
    expect(url.searchParams.get("scope")).toBe("openid profile email");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://workwithme.lol/api/auth/linkedin/callback",
    );
  });

  it("keeps apex and www callback hosts", () => {
    expect(
      requestHostOrigin("https://www.workwithme.lol/api/auth/linkedin", "https://workwithme.lol"),
    ).toBe("https://www.workwithme.lol");
    expect(
      requestHostOrigin("https://workwithme.lol/api/auth/linkedin", "https://x.example"),
    ).toBe("https://workwithme.lol");
  });

  it("returns oauth_not_configured when LinkedIn secrets are missing", async () => {
    const app = createApp({
      store: new MemoryStore(),
      config: {
        origin: "https://workwithme.lol",
        siteName: "workwithme.lol",
        adminEmails: [],
        emailFrom: "board@workwithme.lol",
      },
    });
    const response = await app.request("https://workwithme.lol/api/auth/linkedin");
    expect(response.status).toBe(501);
    expect(await response.json()).toEqual({
      error: "oauth_not_configured",
      provider: "linkedin",
    });
  });

  it("locks How it works to the four LinkedIn beats", () => {
    expect(HOW_IT_WORKS_STEPS).toEqual([
      "Sign in with LinkedIn.",
      "We fill name, photo, and headline.",
      "You set a bid.",
      "You share your rank.",
    ]);
  });
});
