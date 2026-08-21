export function photoFallback(handle: string): string {
  const params = new URLSearchParams({
    seed: handle,
    backgroundColor: "14140f",
  });
  return `https://api.dicebear.com/9.x/notionists/svg?${params.toString()}`;
}
