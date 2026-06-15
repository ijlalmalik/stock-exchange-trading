import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Briefcase, BarChart3, X } from "lucide-react";
import { SettingsPanel } from "@/components/SettingsPanel";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile/tablet drawer backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        data-open={open ? "true" : "false"}
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-64 max-w-[82vw] flex-col overflow-hidden border-r border-border bg-sidebar/95 backdrop-blur-xl transition-transform duration-300 lg:w-56 lg:max-w-none lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
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
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {NAV.map((item) => {
            const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300 ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border px-3 py-3">
          <SettingsPanel variant="full" className="w-full justify-center" />
        </div>
      </aside>
    </>
  );
}
