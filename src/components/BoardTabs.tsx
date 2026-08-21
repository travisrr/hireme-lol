import { Link } from "react-router-dom";
import {
  BOARD_TABS,
  tabHref,
  type BoardTabId,
} from "../lib/industries";

type BoardTabsProps = {
  active: BoardTabId;
};

export function BoardTabs({ active }: BoardTabsProps) {
  return (
    <div className="board-tabs" role="tablist" aria-label="Board">
      {BOARD_TABS.map((tab) => {
        const selected = tab.id === active;
        return (
          <Link
            key={tab.id}
            to={tabHref(tab.id)}
            role="tab"
            aria-selected={selected}
            data-active={selected ? "true" : "false"}
            className="board-tab"
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
