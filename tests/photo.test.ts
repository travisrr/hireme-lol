import { describe, expect, it } from "vitest";
import { FOUNDING_HEADSHOT_KEYS } from "../src/lib/media";
import { isUsableHeadshotUrl, publicPhotoSrc } from "../src/lib/photo";

describe("headshots", () => {
  it("rejects generated avatars and initials services", () => {
    expect(isUsableHeadshotUrl("https://api.dicebear.com/7.x/initials/svg")).toBe(
      false,
    );
    expect(publicPhotoSrc("https://ui-avatars.com/api/?name=Elon")).toBe(null);
  });

  it("keeps real photos and empty slots", () => {
    expect(publicPhotoSrc(null)).toBe(null);
    expect(publicPhotoSrc("/lock-shots/maya.jpg")).toBe("/lock-shots/maya.jpg");
    expect(publicPhotoSrc("https://media.licdn.com/dms/image/face.jpg")).toBe(
      "https://media.licdn.com/dms/image/face.jpg",
    );
    expect(publicPhotoSrc("photos/abc.jpg")).toBe("/api/media/photos/abc.jpg");
  });

  it("maps founding R2 keys to media URLs so the tiles are not empty", () => {
    expect(publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.elon)).toBe(
      "/api/media/photos/founding-elon.jpg",
    );
    expect(publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.palmer)).toBe(
      "/api/media/photos/founding-palmer.jpg",
    );
    expect(publicPhotoSrc(FOUNDING_HEADSHOT_KEYS.jensen)).toBe(
      "/api/media/photos/founding-jensen.jpg",
    );
  });
});
