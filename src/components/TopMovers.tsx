import { TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { StockHolding } from "@/lib/google-sheets";

interface TopMoversProps {
  holdings: StockHolding[];
}

export function TopMovers({ holdings }: TopMoversProps) {
  const sorted = [...holdings].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.filter((h) => h.changePercent > 0);
  const losers = sorted.filter((h) => h.changePercent < 0).reverse();

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Gainers */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gain" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gain">Top Gainers</h3>
        </div>
        <div className="space-y-1">
          {gainers.map((h) => (
            <Link
              key={h.script}
              to="/portfolio"
              search={{ highlight: h.script }}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-hover"
            >
              <div>
                <p className="text-sm font-bold text-foreground">{h.script}</p>
                <p className="max-w-[200px] truncate text-xs text-muted-foreground">{h.company}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-semibold text-gain">+{h.changePercent.toFixed(2)}%</p>
                <p className="text-xs font-mono text-muted-foreground">PKR {Math.abs(h.change).toLocaleString()}</p>
              </div>
            </Link>
          ))}
          {gainers.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">No gainers</p>}
        </div>
      </div>

      {/* Losers */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-loss" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-loss">Top Losers</h3>
        </div>
        <div className="space-y-1">
          {losers.map((h) => (
            <Link
              key={h.script}
              to="/portfolio"
              search={{ highlight: h.script }}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-hover"
            >
              <div>
                <p className="text-sm font-bold text-foreground">{h.script}</p>
                <p className="max-w-[200px] truncate text-xs text-muted-foreground">{h.company}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-semibold text-loss">{h.changePercent.toFixed(2)}%</p>
                <p className="text-xs font-mono text-muted-foreground">PKR {Math.abs(h.change).toLocaleString()}</p>
              </div>
            </Link>
          ))}
          {losers.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">No losers</p>}
        </div>
      </div>
    </div>
  );
}
