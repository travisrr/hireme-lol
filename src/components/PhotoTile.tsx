type PhotoTileProps = {
  src: string | null;
  alt?: string;
  className?: string;
};

export function PhotoTile({ src, alt = "", className = "size-9" }: PhotoTileProps) {
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-[12px] bg-paper ${src ? "" : "border border-line"} ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : null}
    </span>
  );
}
