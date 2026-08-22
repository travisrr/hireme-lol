import { describe, expect, it } from "vitest";
import { isLiveLinkedInProfile, joinStepFromServer } from "../src/lib/join-gate";

describe("join LinkedIn wall", () => {
  it("does not skip Sign in with LinkedIn for leftover user or draft", () => {
    expect(
      joinStepFromServer({
        hasUser: true,
        oauthProfile: null,
      }),
    ).toBe("signin");
    expect(
      joinStepFromServer({
        hasUser: true,
        oauthProfile: { displayName: "  ", photoUrl: "/old.jpg" },
      }),
    ).toBe("signin");
    expect(
      joinStepFromServer({
        hasUser: false,
        oauthProfile: { displayName: "Stale", photoUrl: "/old.jpg" },
      }),
    ).toBe("signin");
  });

  it("opens the bid form only after a live LinkedIn profile this visit", () => {
    expect(isLiveLinkedInProfile({ displayName: "Maya Chen" })).toBe(true);
    expect(
      joinStepFromServer({
        hasUser: true,
        oauthProfile: { displayName: "Maya Chen", photoUrl: "/maya.jpg" },
      }),
    ).toBe("identity");
  });

  it("keeps the share sheet after a paid session without reopening sign-in", () => {
    expect(
      joinStepFromServer({
        hasUser: true,
        oauthProfile: null,
        paid: true,
      }),
    ).toBe("share");
    expect(
      joinStepFromServer({
        hasUser: false,
        oauthProfile: null,
        paid: true,
      }),
    ).toBe("signin");
  });
});
