import { Menu, Smartphone, Monitor, Sun, Moon } from "lucide-react";
import { useViewMode } from "@/lib/view-mode";
import { useTheme } from "@/lib/theme";
import { SettingsPanel } from "@/components/SettingsPanel";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { mode, toggleMode } = useViewMode();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl lg:hidden">
      <button
        onClick={onMenuClick}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-all hover:bg-surface-hover"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
        <span className="text-xs">Menu</span>
      </button>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">I</div>
        <span className="text-sm font-bold text-foreground">Portfolio</span>
      </div>
      <div className="flex items-center gap-1.5">
        <SettingsPanel variant="icon" />
        <button
          onClick={toggleMode}
          title={mode === "mobile" ? "Switch to desktop view" : "Switch to mobile view"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-all hover:bg-surface-hover hover:border-primary/40"
          aria-label="Toggle view mode"
        >
          {mode === "mobile" ? <Monitor className="h-4 w-4 text-primary" /> : <Smartphone className="h-4 w-4 text-primary" />}
        </button>
      </div>
    </header>
  );
}

/**
 * Floating quick-controls — bottom-right corner.
 */
export function ViewModeFloating() {
  const { mode, toggleMode } = useViewMode();
  const { theme, toggleTheme } = useTheme();

  const baseBtn =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/80 text-foreground shadow-lg backdrop-blur-xl transition-all duration-200 hover:scale-105 hover:text-primary hover:shadow-primary/30 hover:border-primary/50";

  return (
    <div
      className="fixed z-50 flex flex-col items-center gap-2"
      style={{
        right: "max(16px, env(safe-area-inset-right))",
        bottom: "max(16px, env(safe-area-inset-bottom))",
      }}
    >
      <button
        data-no-glass
        onClick={toggleTheme}
        title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        aria-label="Toggle theme"
        className={baseBtn}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <button
        data-no-glass
        onClick={toggleMode}
        title={mode === "mobile" ? "Switch to desktop view" : "Switch to mobile view"}
        aria-label="Toggle view mode"
        className={`${baseBtn} hidden lg:inline-flex`}
      >
        {mode === "mobile" ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
      </button>
    </div>
  );
}
