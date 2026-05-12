import { createContext, useContext, type ReactNode } from "react";

// Legacy "force mobile preview" toggle has been removed in favor of a true
// responsive mobile-first layout. This module is kept as a no-op shim so any
// remaining imports continue to compile.
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
  return (
    <ViewModeContext.Provider
      value={{ mode: "auto", setMode: () => {}, toggleMode: () => {} }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export const useViewMode = () => useContext(ViewModeContext);
