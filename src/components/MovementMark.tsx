import { assertNever } from "../lib/ranking";
import type { Movement } from "../lib/types";

export function MovementMark({ movement }: { movement: Movement }) {
  switch (movement) {
    case "up":
      return <span className="font-mono text-xs text-up">↑</span>;
    case "down":
      return <span className="font-mono text-xs text-down">↓</span>;
    case "new":
      return (
        <span className="font-mono text-[10px] tracking-wide text-paper uppercase">
          new
        </span>
      );
    case "same":
      return <span className="font-mono text-xs text-mute">–</span>;
    default:
      return assertNever(movement);
  }
}
