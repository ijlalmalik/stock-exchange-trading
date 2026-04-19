import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Briefcase, BarChart3, Radio, Sun, Moon, Coffee, FileSpreadsheet, X } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";
import { useViewMode } from "@/lib/view-mode";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/ldcp", label: "LDCP Live", icon: Radio },
  { to: "/sheet", label: "Sheet", icon: FileSpreadsheet },
] as const;

const THEMES: { id: Theme; icon: typeof Sun; label: string }[] = [
  { id: "dark", icon: Moon, label: "Dark" },
  { id: "light", icon: Sun, label: "Light" },
  { id: "sepia", icon: Coffee, label: "Sepia" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { mode } = useViewMode();
  const forceMobile = mode === "mobile";

  // In forceMobile, sidebar always behaves like mobile drawer (no auto-open on lg)
  const desktopOpenClass = forceMobile ? "" : "lg:translate-x-0";
  const backdropHide = forceMobile ? "" : "lg:hidden";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${backdropHide} ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-border bg-sidebar/90 backdrop-blur-xl transition-transform duration-300 ${desktopOpenClass} ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/30">I</div>
            <div>
              <p className="text-sm font-bold text-sidebar-foreground">Ijlal's Portfolio</p>
              <p className="text-[10px] text-muted-foreground">PSX Tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground ${forceMobile ? "" : "lg:hidden"}`}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-2">
          {NAV.map((item) => {
            const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-0.5"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border px-3 py-3">
          <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Theme</p>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
            {THEMES.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.label}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-medium transition-all duration-300 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <t.icon className="h-3 w-3" />
                  <span className="hidden xl:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
