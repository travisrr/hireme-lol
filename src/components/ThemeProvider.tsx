import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, type ThemeContextValue } from "../hooks/useTheme";
import {
  applyTheme,
  oppositeTheme,
  persistTheme,
  resolvedTheme,
  storedTheme,
  systemTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "../lib/theme";

function readDomTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readDomTheme);

  useEffect(() => {
    applyTheme(resolvedTheme());
    setTheme(readDomTheme());

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      if (storedTheme() != null) return;
      applyTheme(systemTheme());
      setTheme(readDomTheme());
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key != null && event.key !== THEME_STORAGE_KEY) return;
      applyTheme(resolvedTheme());
      setTheme(readDomTheme());
    };

    media.addEventListener("change", onSystem);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", onSystem);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () => {
        const next = oppositeTheme(theme);
        persistTheme(next);
        setTheme(next);
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
