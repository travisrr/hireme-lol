const GENERATED =
  /dicebear|ui-avatars|notionists|generated\.faces|boringavatars|robohash|adorable\.io|initials/i;

export function isUsableHeadshotUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (GENERATED.test(url)) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  return /^https?:\/\//i.test(url);
}

export function publicPhotoSrc(stored: string | null | undefined): string | null {
  if (!stored) return null;
  if (GENERATED.test(stored)) return null;
  if (stored.startsWith("photos/")) return `/api/media/${stored}`;
  if (stored.startsWith("/api/media/photos/")) return stored;
  if (isUsableHeadshotUrl(stored)) return stored;
  return null;
}

export function isAllowedImageType(type: string): boolean {
  return (
    type === "image/jpeg" ||
    type === "image/jpg" ||
    type === "image/png" ||
    type === "image/webp" ||
    type === "image/gif"
  );
}
