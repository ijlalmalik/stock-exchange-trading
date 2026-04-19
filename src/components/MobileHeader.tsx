import { Menu, Smartphone, Monitor } from "lucide-react";
import { useViewMode } from "@/lib/view-mode";

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
      <button
        onClick={toggleMode}
        title={mode === "mobile" ? "Switch to desktop view" : "Switch to mobile view"}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-2 text-xs font-medium text-foreground transition-all hover:bg-surface-hover hover:border-primary/40"
      >
        {mode === "mobile" ? <Monitor className="h-4 w-4 text-primary" /> : <Smartphone className="h-4 w-4 text-primary" />}
      </button>
    </header>
  );
}

export function ViewModeFloating() {
  const { mode, toggleMode } = useViewMode();
  return (
    <button
      onClick={toggleMode}
      title={mode === "mobile" ? "Switch to desktop view" : "Switch to mobile view"}
      className="fixed bottom-5 right-5 z-40 hidden lg:inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur-xl transition-all hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-primary/20"
    >
      {mode === "mobile" ? (
        <>
          <Monitor className="h-4 w-4 text-primary" />
          Desktop View
        </>
      ) : (
        <>
          <Smartphone className="h-4 w-4 text-primary" />
          Mobile View
        </>
      )}
    </button>
  );
}
