import { useTheme } from "../hooks/useTheme";
import { oppositeTheme, type Theme } from "../lib/theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = toggleLabel(oppositeTheme(theme));

  return (
    <span className="theme-toggle-wrap">
      <button
        type="button"
        className="theme-toggle"
        aria-label={label}
        title={label}
        onClick={toggleTheme}
      >
        <ThemeMark theme={theme} />
      </button>
    </span>
  );
}

function toggleLabel(next: Theme): string {
  switch (next) {
    case "dark":
      return "Switch to dark mode";
    case "light":
      return "Switch to light mode";
    default: {
      const _never: never = next;
      return _never;
    }
  }
}

function ThemeMark({ theme }: { theme: Theme }) {
  switch (theme) {
    case "dark":
      return <SunMark />;
    case "light":
      return <MoonMark />;
    default: {
      const _never: never = theme;
      return _never;
    }
  }
}

function MoonMark() {
  return (
    <svg viewBox="0 0 16 16" className="theme-toggle-icon" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 1.2a6.8 6.8 0 1 0 8.8 8.7 5.4 5.4 0 0 1-8.8-8.7Z"
      />
    </svg>
  );
}

function SunMark() {
  return (
    <svg viewBox="0 0 16 16" className="theme-toggle-icon" aria-hidden="true">
      <circle cx="8" cy="8" r="3.1" fill="currentColor" />
      <path
        fill="currentColor"
        d="M7.25 1.2h1.5v2.1h-1.5zm0 11.5h1.5v2.1h-1.5zM1.2 7.25h2.1v1.5H1.2zm11.5 0h2.1v1.5h-2.1zM3.16 3.16l1.49-1.49 1.48 1.49-1.48 1.48zm6.71 6.71 1.48-1.48 1.49 1.48-1.49 1.49zM12.84 3.16l-1.49-1.49-1.48 1.49 1.48 1.48zM6.13 9.87 4.65 8.39 3.16 9.87l1.49 1.49z"
      />
    </svg>
  );
}
