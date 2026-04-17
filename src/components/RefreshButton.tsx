import { RefreshCw } from "lucide-react";
import { usePortfolio } from "@/lib/portfolio-store";

function timeAgo(d: Date | null): string {
  if (!d) return "never";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export function RefreshButton() {
  const { refresh, refreshing, lastUpdated } = usePortfolio();
  return (
    <button
      onClick={() => void refresh()}
      disabled={refreshing}
      title="Refresh all data sources"
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-all duration-300 hover:bg-surface-hover hover:border-primary/40 disabled:opacity-60"
    >
      <RefreshCw className={`h-3.5 w-3.5 text-primary ${refreshing ? "animate-spin" : ""}`} />
      <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
      <span className="hidden sm:inline text-muted-foreground">• {timeAgo(lastUpdated)}</span>
    </button>
  );
}
