import { describe, expect, it } from "vitest";
import { FOUNDING_HEADSHOT_KEYS } from "../src/lib/media";
import { isUsableHeadshotUrl, publicPhotoSrc } from "../src/lib/photo";

describe("headshots", () => {
  it("rejects generated avatars and initials services", () => {
    expect(isUsableHeadshotUrl("https://api.dicebear.com/7.x/initials/svg")).toBe(
      false,
    );
    expect(publicPhotoSrc("https://ui-avatars.com/api/?name=Elon")).toBe(null);
    expect(publicPhotoSrc("https://api.dicebear.com/7.x/notionists/svg")).toBe(
      null,
    );
  });

  it("maps founding R2 keys to media URLs", () => {
    expect(publicPhotoSrc(null)).toBe(null);
    expect(publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.elon)).toBe(
      "/api/media/photos/founding-elon.webp",
    );
    expect(publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.palmer)).toBe(
      "/api/media/photos/founding-palmer.webp",
    );
    expect(publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.jensen)).toBe(
      "/api/media/photos/founding-jensen.webp",
    );
  });
});
