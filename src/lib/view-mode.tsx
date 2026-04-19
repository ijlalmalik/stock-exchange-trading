import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ViewMode = "auto" | "mobile";

interface ViewModeContextType {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  toggleMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextType>({
  mode: "auto",
  setMode: () => {},
  toggleMode: () => {},
});

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>("auto");

  useEffect(() => {
    const stored = localStorage.getItem("portfolio-view-mode") as ViewMode | null;
    if (stored === "mobile" || stored === "auto") setModeState(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("portfolio-view-mode", mode);
    document.documentElement.classList.toggle("force-mobile", mode === "mobile");
  }, [mode]);

  const setMode = (m: ViewMode) => setModeState(m);
  const toggleMode = () => setModeState((m) => (m === "mobile" ? "auto" : "mobile"));

  return (
    <ViewModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export const useViewMode = () => useContext(ViewModeContext);
