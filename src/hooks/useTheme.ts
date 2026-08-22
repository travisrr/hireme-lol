import { createContext, useContext } from "react";
import type { Theme } from "../lib/theme";

export type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme needs ThemeProvider");
  }
  return context;
}
