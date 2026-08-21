import { describe, expect, it } from "vitest";
import { FOUNDING_HEADSHOT_KEYS, MemoryMedia, isSafePhotoKey } from "../src/lib/media";
import { createApp } from "../src/server/app";
import { MemoryStore } from "../src/server/memory-store";

describe("media objects", () => {
  it("uses photos/ keys for the founding Wikimedia portraits", () => {
    expect(FOUNDING_HEADSHOT_KEYS.elon).toBe("photos/founding-elon.jpg");
    expect(FOUNDING_HEADSHOT_KEYS.palmer).toBe("photos/founding-palmer.jpg");
    expect(FOUNDING_HEADSHOT_KEYS.jensen).toBe("photos/founding-jensen.jpg");
    expect(isSafePhotoKey(FOUNDING_HEADSHOT_KEYS.elon)).toBe(true);
    expect(isSafePhotoKey("../secret")).toBe(false);
  });

  it("serves stored bytes from /api/media", async () => {
    const media = new MemoryMedia();
    await media.put("photos/founding-elon.jpg", new Uint8Array([255, 216, 255]), {
      httpMetadata: { contentType: "image/jpeg" },
    });
    const app = createApp({
      store: new MemoryStore(),
      config: {
        origin: "http://localhost:5173",
        siteName: "workwithme.lol",
        adminEmails: [],
        emailFrom: "board@workwithme.lol",
      },
      media,
    });
    const ok = await app.request("/api/media/photos/founding-elon.jpg");
    expect(ok.status).toBe(200);
    expect(ok.headers.get("content-type")).toBe("image/jpeg");
    const missing = await app.request("/api/media/photos/nope.jpg");
    expect(missing.status).toBe(404);
  });
});
