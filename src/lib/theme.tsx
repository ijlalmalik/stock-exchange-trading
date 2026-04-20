import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  cycleTheme: () => void;
  toggleTheme: () => void;
}

const ORDER: Theme[] = ["dark", "light"];

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  cycleTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("portfolio-theme") as Theme | null;
    // Migrate old "sepia" value to "light"
    if (stored === "light" || stored === "dark") setThemeState(stored);
    else if (stored === ("sepia" as Theme)) setThemeState("light");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "sepia");
    if (theme === "dark") root.classList.add("dark");
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const cycleTheme = () =>
    setThemeState((t) => ORDER[(ORDER.indexOf(t) + 1) % ORDER.length]);
  const toggleTheme = cycleTheme;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
