export function photoFallback(handle: string): string {
  const params = new URLSearchParams({
    seed: handle,
    backgroundColor: "f7f4ee",
  });
  return `https://api.dicebear.com/9.x/notionists/svg?${params.toString()}`;
}
