import { createFileRoute } from "@tanstack/react-router";
import { getPortfolioSummary } from "@/lib/google-sheets";
import { usePortfolio } from "@/lib/portfolio-store";
import { TrendingUp, TrendingDown, Target, BarChart3 } from "lucide-react";
import { RefreshButton } from "@/components/RefreshButton";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { holdings, loading } = usePortfolio();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const summary = getPortfolioSummary(holdings);
  const totalCurrent = summary.totalCurrentValue;

  // 52-week range data
  const rangeData = holdings.map((h) => ({
    script: h.script,
    low: h.week52Low,
    high: h.week52High,
    current: h.ldcp,
    range: h.week52High - h.week52Low,
    position: h.week52High > h.week52Low ? ((h.ldcp - h.week52Low) / (h.week52High - h.week52Low)) * 100 : 50,
  }));

  const perfData = [...holdings]
    .sort((a, b) => b.changePercent - a.changePercent)
    .map((h) => ({
      script: h.script,
      company: h.company,
      ldcp: h.ldcp,
      change: h.change,
      changePercent: h.changePercent,
      weight: totalCurrent > 0 ? (h.currentValue / totalCurrent) * 100 : 0,
    }));

  const maxAbsChange = Math.max(...perfData.map((holding) => Math.abs(holding.changePercent)), 1);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Deep dive into your portfolio performance</p>
        </div>
        <RefreshButton />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="animate-fade-in rounded-xl border border-border bg-card p-4" style={{ animationDelay: "0ms" }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Best Performer</span>
          </div>
          <p className="mt-2 text-lg font-bold text-gain">
            {perfData[0]?.script} ({perfData[0]?.changePercent >= 0 ? "+" : ""}{perfData[0]?.changePercent.toFixed(2)}%)
          </p>
        </div>
        <div className="animate-fade-in rounded-xl border border-border bg-card p-4" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Worst Performer</span>
          </div>
          <p className="mt-2 text-lg font-bold text-loss">
            {perfData[perfData.length - 1]?.script} ({perfData[perfData.length - 1]?.changePercent.toFixed(2)}%)
          </p>
        </div>
        <div className="animate-fade-in rounded-xl border border-border bg-card p-4" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Return %</span>
          </div>
          <p className={`mt-2 text-lg font-bold ${summary.returnPct >= 0 ? "text-gain" : "text-loss"}`}>
            {summary.returnPct >= 0 ? "+" : ""}{summary.returnPct.toFixed(2)}%
          </p>
        </div>
        <div className="animate-fade-in rounded-xl border border-border bg-card p-4" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Stocks</span>
          </div>
          <p className="mt-2 text-lg font-bold text-foreground">{holdings.length}</p>
        </div>
      </div>

      {/* Performance Comparison */}
      <div className="animate-fade-in rounded-xl border border-border bg-card p-5" style={{ animationDelay: "200ms" }}>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Performance Comparison (%)</h3>
            <p className="mt-1 text-sm text-muted-foreground">Ranked daily view with clearer price, move, and holding weight.</p>
          </div>
          <div className="text-[11px] text-muted-foreground">Sorted highest to lowest % change</div>
        </div>

        <div className="space-y-3">
          {perfData.map((holding, index) => {
            const positive = holding.changePercent >= 0;
            const barWidth = Math.max((Math.abs(holding.changePercent) / maxAbsChange) * 100, 8);

            return (
              <div
                key={holding.script}
                className="rounded-xl border border-border bg-surface px-4 py-3 transition-all duration-300 hover:bg-surface-hover"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">#{index + 1}</span>
                      <h4 className="text-sm font-bold text-foreground">{holding.script}</h4>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{holding.company}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${positive ? "bg-gain-bg text-gain" : "bg-loss-bg text-loss"}`}>
                      {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {positive ? "+" : ""}{holding.changePercent.toFixed(2)}%
                    </div>
                    <div className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                      LDCP <span className="font-semibold text-foreground">PKR {holding.ldcp.toFixed(2)}</span>
                    </div>
                    <div className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                      Move <span className={`font-semibold ${positive ? "text-gain" : "text-loss"}`}>{positive ? "+" : ""}{holding.change.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${positive ? "bg-gain" : "bg-loss"}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-xs font-mono text-muted-foreground">
                    {holding.weight.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 52-Week Range */}
      <div className="animate-fade-in rounded-xl border border-border bg-card p-5" style={{ animationDelay: "300ms" }}>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">52-Week Range Position</h3>
        <div className="space-y-4">
          {rangeData.map((r, idx) => (
            <div key={r.script} className="animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">{r.script}</span>
                <span className="font-mono text-muted-foreground">
                  {r.low.toFixed(0)} — <span className="text-foreground font-semibold">{r.current.toFixed(2)}</span> — {r.high.toFixed(0)}
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-surface">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-loss via-muted-foreground to-gain transition-all duration-500"
                  style={{ width: "100%" }}
                />
                <div
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary shadow-md transition-all duration-500"
                  style={{ left: `${Math.min(Math.max(r.position, 2), 98)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
