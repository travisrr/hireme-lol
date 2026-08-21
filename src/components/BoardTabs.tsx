export const BOARD_TABS = ["Overall"] as const;

export function BoardTabs() {
  return (
    <div className="board-tabs" role="tablist" aria-label="Board">
      {BOARD_TABS.map((label) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected="true"
          data-active="true"
          className="board-tab"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
