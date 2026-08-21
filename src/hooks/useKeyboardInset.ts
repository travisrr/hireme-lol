import { useEffect } from "react";

export function useKeyboardInset() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const sync = () => {
      const inset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      document.documentElement.style.setProperty(
        "--keyboard-inset",
        `${inset}px`,
      );
    };

    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    sync();
    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
      document.documentElement.style.removeProperty("--keyboard-inset");
    };
  }, []);
}
