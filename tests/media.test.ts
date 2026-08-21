import { describe, expect, it } from "vitest";
import {
  FOUNDING_HEADSHOT_KEYS,
  MemoryMedia,
  isSafePhotoKey,
  photoKeyForUser,
} from "../src/lib/media";
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

  it("uploads a signed-in headshot to R2-shaped storage", async () => {
    const media = new MemoryMedia();
    const store = new MemoryStore();
    const app = createApp({
      store,
      media,
      config: {
        origin: "http://localhost:5173",
        siteName: "workwithme.lol",
        adminEmails: [],
        emailFrom: "board@workwithme.lol",
      },
    });
    const magic = await app.request("/api/auth/magic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "maya@example.com" }),
    });
    const previewUrl = String(((await magic.json()) as { previewUrl: string }).previewUrl);
    const verify = await app.request(previewUrl.replace("http://localhost:5173", ""));
    const cookie = /wmw_session=([^;]+)/.exec(verify.headers.get("set-cookie") ?? "");
    if (!cookie) throw new Error("missing session cookie");
    const form = new FormData();
    form.append(
      "photo",
      new File([new Uint8Array([255, 216, 255, 224])], "head.jpg", {
        type: "image/jpeg",
      }),
    );
    const uploaded = await app.request("/api/me/photo", {
      method: "POST",
      headers: { Cookie: `wmw_session=${cookie[1]}` },
      body: form,
    });
    expect(uploaded.status).toBe(200);
    const body = (await uploaded.json()) as { photoKey: string; photoUrl: string };
    expect(isSafePhotoKey(body.photoKey)).toBe(true);
    expect(body.photoUrl).toBe(`/api/media/${body.photoKey}`);
    expect(await media.get(body.photoKey)).not.toBeNull();
    expect(photoKeyForUser("user-1", "image/jpeg")).toMatch(/^photos\/[a-z0-9-]+\.jpg$/);
  });
});
