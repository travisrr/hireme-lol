import { isAllowedImageType } from "./photo";

export const FOUNDING_HEADSHOT_KEYS = {
  elon: "photos/founding-elon.jpg",
  palmer: "photos/founding-palmer.jpg",
  jensen: "photos/founding-jensen.jpg",
} as const;

export function isSafePhotoKey(key: string): boolean {
  return /^photos\/[a-z0-9._-]+$/i.test(key);
}

export type MediaObject = {
  body: ReadableStream | ArrayBuffer | Uint8Array | Blob;
  httpMetadata?: { contentType?: string };
};

export type MediaBucket = {
  get(key: string): Promise<MediaObject | null>;
  put(
    key: string,
    value: ArrayBuffer | Uint8Array,
    options?: { httpMetadata?: { contentType: string } },
  ): Promise<unknown>;
};

export class MemoryMedia implements MediaBucket {
  readonly objects = new Map<string, { bytes: Uint8Array; contentType: string }>();

  async get(key: string): Promise<MediaObject | null> {
    const found = this.objects.get(key);
    if (!found) return null;
    return {
      body: found.bytes,
      httpMetadata: { contentType: found.contentType },
    };
  }

  async put(
    key: string,
    value: ArrayBuffer | Uint8Array,
    options?: { httpMetadata?: { contentType: string } },
  ): Promise<unknown> {
    const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
    this.objects.set(key, {
      bytes,
      contentType: options?.httpMetadata?.contentType ?? "application/octet-stream",
    });
    return { key };
  }
}

const MAX_BYTES = 5 * 1024 * 1024;

export async function storeHeadshotFromUrl(
  media: MediaBucket,
  key: string,
  imageUrl: string,
  fetchFn: typeof fetch = fetch,
): Promise<string | null> {
  const response = await fetchFn(imageUrl, {
    headers: {
      Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    },
    redirect: "follow",
  });
  if (!response.ok) return null;
  const type = (response.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (!isAllowedImageType(type)) return null;
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return null;
  await media.put(key, bytes, { httpMetadata: { contentType: type } });
  return key;
}
