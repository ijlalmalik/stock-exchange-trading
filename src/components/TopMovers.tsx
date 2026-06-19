import { TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { StockHolding } from "@/lib/google-sheets";

interface TopMoversProps {
  holdings: StockHolding[];
}

function formatPKR(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function TopMovers({ holdings }: TopMoversProps) {
  const sorted = [...holdings].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.filter((h) => h.changePercent > 0);
  const losers = sorted.filter((h) => h.changePercent < 0).reverse();

  return (
    <div className="grid gap-4 sm:gap-5 grid-cols-1 lg:grid-cols-2">
      {/* Gainers */}
      <div className="animate-fade-in rounded-xl border border-border bg-card p-3.5 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gain" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gain">Top Gainers</h3>
        </div>
        <div className="space-y-1">
          {gainers.map((h, idx) => (
            <Link
              key={h.script}
              to="/portfolio"
              search={{ highlight: h.script }}
              className="animate-fade-in flex min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-surface-hover"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{h.script}</p>
                <p className="truncate text-xs text-muted-foreground">{h.company}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-mono font-semibold text-gain">+{h.changePercent.toFixed(2)}%</p>
                <p className="text-xs font-mono text-foreground">PKR {formatPKR(h.ldcp)}</p>
                <p className="text-[10px] font-mono text-muted-foreground">P/L {formatPKR(Math.abs(h.change))}</p>
              </div>
            </Link>
          ))}
          {gainers.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">No gainers</p>}
        </div>
      </div>

      {/* Losers */}
      <div className="animate-fade-in rounded-xl border border-border bg-card p-3.5 sm:p-5" style={{ animationDelay: "100ms" }}>
        <div className="mb-4 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-loss" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-loss">Top Losers</h3>
        </div>
        <div className="space-y-1">
          {losers.map((h, idx) => (
            <Link
              key={h.script}
              to="/portfolio"
              search={{ highlight: h.script }}
              className="animate-fade-in flex min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-surface-hover"
              style={{ animationDelay: `${(idx + 1) * 80 + 100}ms` }}
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{h.script}</p>
                <p className="truncate text-xs text-muted-foreground">{h.company}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-mono font-semibold text-loss">{h.changePercent.toFixed(2)}%</p>
                <p className="text-xs font-mono text-foreground">PKR {formatPKR(h.ldcp)}</p>
                <p className="text-[10px] font-mono text-muted-foreground">P/L {formatPKR(Math.abs(h.change))}</p>
              </div>
            </Link>
          ))}
          {losers.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">No losers</p>}
        </div>
      </div>
    </div>
  );
}
