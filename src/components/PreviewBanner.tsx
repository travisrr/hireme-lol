import { MOCK_BOARD_NOTICE } from "../mock/board";

export function PreviewBanner() {
  return (
    <div className="border-b border-money/30 bg-money text-ink">
      <p className="mx-auto max-w-6xl px-4 py-2 text-center font-mono text-[11px] font-medium tracking-wide uppercase sm:text-xs">
        {MOCK_BOARD_NOTICE}
      </p>
    </div>
  );
}
