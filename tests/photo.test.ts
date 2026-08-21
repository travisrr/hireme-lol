import { describe, expect, it } from "vitest";
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
});
