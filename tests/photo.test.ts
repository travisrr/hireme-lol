import { describe, expect, it } from "vitest";
import { FOUNDING_OG_PHOTO_KEYS } from "../src/lib/media";
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

  it("keeps real photos and empty slots", () => {
    expect(publicPhotoSrc(null)).toBe(null);
    expect(publicPhotoSrc("")).toBe(null);
    expect(publicPhotoSrc("https://media.licdn.com/dms/image/face.jpg")).toBe(
      "https://media.licdn.com/dms/image/face.jpg",
    );
    expect(publicPhotoSrc(FOUNDING_OG_PHOTO_KEYS.jensen)).toBe(
      "/api/media/photos/og-jenhsunhuang.jpg",
    );
  });
});
