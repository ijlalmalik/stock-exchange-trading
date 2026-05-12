import { Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { SettingsPanel } from "@/components/SettingsPanel";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-background/85 px-3 py-2.5 backdrop-blur-xl lg:hidden"
      style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
    >
      <button
        onClick={onMenuClick}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-all active:scale-95 hover:bg-surface-hover"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
          I
        </div>
        <span className="truncate text-sm font-bold text-foreground">Ijlal's Portfolio</span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <SettingsPanel variant="icon" />
      </div>
    </header>
  );
}

/**
 * Floating theme toggle — bottom-right, sits above mobile bottom nav via offset.
 */
export function ViewModeFloating() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="fixed z-50"
      style={{
        right: "max(12px, env(safe-area-inset-right))",
        bottom: "calc(env(safe-area-inset-bottom) + 4.5rem)",
      }}
    >
      <button
        data-no-glass
        onClick={toggleTheme}
        title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        aria-label="Toggle theme"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/85 text-foreground shadow-lg backdrop-blur-xl transition-all duration-200 active:scale-95 hover:scale-105 hover:text-primary hover:border-primary/50 lg:bottom-4"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>
  );
}
