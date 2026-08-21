type PhotoTileProps = {
  src: string | null;
  alt?: string;
  initials?: string;
  className?: string;
};

export function PhotoTile({
  src,
  alt = "",
  initials = "",
  className = "size-8",
}: PhotoTileProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-paper text-[10px] font-bold text-mute ${src ? "" : "border border-line"} ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}
