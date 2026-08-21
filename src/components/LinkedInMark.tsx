type LinkedInMarkProps = {
  tone?: "color" | "onAccent";
};

export function LinkedInMark({ tone = "color" }: LinkedInMarkProps) {
  if (tone === "onAccent") {
    return (
      <svg viewBox="0 0 20 20" className="size-5 shrink-0" aria-hidden="true">
        <path
          fill="#ffffff"
          d="M5.7 8.2h1.86v6.05H5.7V8.2Zm.93-2.98c.6 0 1.08.48 1.08 1.08 0 .59-.48 1.07-1.08 1.07a1.08 1.08 0 0 1 0-2.15ZM8.86 8.2h1.78v.83h.03c.25-.47.85-.96 1.76-.96 1.88 0 2.23 1.24 2.23 2.85v3.33h-1.86v-2.95c0-.7-.01-1.61-.98-1.61-.98 0-1.13.77-1.13 1.56v3h-1.83V8.2Z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" className="size-5 shrink-0" aria-hidden="true">
      <rect width="20" height="20" rx="3" fill="#0A66C2" />
      <path
        fill="#ffffff"
        d="M5.7 8.2h1.86v6.05H5.7V8.2Zm.93-2.98c.6 0 1.08.48 1.08 1.08 0 .59-.48 1.07-1.08 1.07a1.08 1.08 0 0 1 0-2.15ZM8.86 8.2h1.78v.83h.03c.25-.47.85-.96 1.76-.96 1.88 0 2.23 1.24 2.23 2.85v3.33h-1.86v-2.95c0-.7-.01-1.61-.98-1.61-.98 0-1.13.77-1.13 1.56v3h-1.83V8.2Z"
      />
    </svg>
  );
}
