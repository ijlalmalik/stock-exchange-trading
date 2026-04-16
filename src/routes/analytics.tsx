import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchPortfolioData, getPortfolioSummary, type StockHolding } from "@/lib/google-sheets";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Target, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData()
      .then(setHoldings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  // Allocation data for pie
  const allocData = holdings.map((h) => ({
    name: h.script,
    value: h.currentValue,
    pct: totalCurrent > 0 ? (h.currentValue / totalCurrent) * 100 : 0,
  }));

  const COLORS = [
    "oklch(0.65 0.2 250)", "oklch(0.6 0.18 170)", "oklch(0.7 0.2 45)",
    "oklch(0.6 0.22 310)", "oklch(0.65 0.2 25)", "oklch(0.55 0.15 200)",
    "oklch(0.7 0.18 130)", "oklch(0.6 0.2 80)", "oklch(0.55 0.22 340)",
  ];

  // Performance comparison
  const perfData = [...holdings]
    .sort((a, b) => b.changePercent - a.changePercent)
    .map((h) => ({
      script: h.script,
      changePercent: h.changePercent,
    }));

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep dive into your portfolio performance</p>
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
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Performance Comparison (%)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={perfData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis dataKey="script" type="category" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={60} />
            <Bar dataKey="changePercent" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {perfData.map((entry, i) => (
                <Cell key={i} fill={entry.changePercent >= 0 ? "var(--color-gain)" : "var(--color-loss)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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
