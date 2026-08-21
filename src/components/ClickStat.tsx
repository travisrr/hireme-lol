type ClickStatProps = {
  count: number;
};

export function ClickStat({ count }: ClickStatProps) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 text-mute tabular"
      title={`${count} clicks`}
    >
      <svg
        viewBox="0 0 16 16"
        className="size-3.5 fill-none stroke-current"
        aria-hidden="true"
      >
        <path
          d="M3.5 2.5 12 8.2l-4.1.7-1.6 3.6L3.5 2.5Z"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      {count}
    </span>
  );
}
