export const PHOTO_RADIUS_PX = 12;

type PhotoTileProps = {
  src: string | null;
  alt?: string;
  className?: string;
  radius?: number;
};

export function PhotoTile({
  src,
  alt = "",
  className = "size-11",
  radius = PHOTO_RADIUS_PX,
}: PhotoTileProps) {
  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden bg-card ${src ? "" : "border border-line"} ${className}`}
      style={{ borderRadius: radius }}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : null}
    </span>
  );
}
