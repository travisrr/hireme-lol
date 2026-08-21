import { assertNever } from "../lib/ranking";
import type { Movement } from "../lib/types";

export function MovementMark({ movement }: { movement: Movement }) {
  switch (movement) {
    case "up":
      return <span className="text-xs font-semibold text-accent">↑</span>;
    case "down":
      return <span className="text-xs font-semibold text-down">↓</span>;
    case "new":
      return (
        <span className="text-[10px] font-semibold tracking-wide text-accent uppercase">
          new
        </span>
      );
    case "same":
      return <span className="text-xs text-mute">–</span>;
    default:
      return assertNever(movement);
  }
}
