import { describe, expect, it } from "vitest";
import { createApp } from "../src/server/app";
import { MemoryStore } from "../src/server/memory-store";
import {
  fetchPublicLinkedinPreview,
  parseLinkedinHtml,
} from "../src/lib/linkedin";

describe("linkedin public preview", () => {
  it("reads og title, description, and image from one profile page", () => {
    const pulled = parseLinkedinHtml(
      `<html><head>
        <meta property="og:title" content="Maya Chen - Founder at North">
        <meta property="og:description" content="Building tools at North">
        <meta property="og:image" content="https://media.licdn.com/dms/image/maya.jpg">
        </head></html>`,
      "https://www.linkedin.com/in/mayachen",
    );
    expect(pulled.displayName).toBe("Maya Chen");
    expect(pulled.headline).toBe("Founder");
    expect(pulled.ogImageUrl).toBe("https://media.licdn.com/dms/image/maya.jpg");
  });

  it("returns empty fields when the public page is blocked", async () => {
    const preview = await fetchPublicLinkedinPreview(
      "https://www.linkedin.com/in/you",
      async () => new Response("blocked", { status: 999 }),
    );
    expect(preview.linkedinUrl).toBe("https://www.linkedin.com/in/you");
    expect(preview.displayName).toBe("");
    expect(preview.headline).toBe("");
    expect(preview.photoUrl).toBe("");
  });

  it("does not fail join when preview fetch throws", async () => {
    const app = createApp({
      store: new MemoryStore(),
      config: {
        origin: "http://localhost:5173",
        siteName: "workwithme.lol",
        adminEmails: [],
        paddleEnvironment: "sandbox",
        emailFrom: "board@workwithme.lol",
      },
      fetchImpl: async () => {
        throw new Error("network");
      },
    });
    const response = await app.request("/api/linkedin/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://www.linkedin.com/in/you" }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { displayName: string };
    expect(body.displayName).toBe("");
  });
});
