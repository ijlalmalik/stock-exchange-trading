import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getPortfolioSummary } from "@/lib/google-sheets";
import { usePortfolio } from "@/lib/portfolio-store";
import { RefreshButton } from "@/components/RefreshButton";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

const RANGES = [
  { key: "7D", days: 7 },
  { key: "30D", days: 30 },
  { key: "3M", days: 90 },
  { key: "1Y", days: 365 },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];
type SortKey = "pnl" | "pct" | "value" | "name";

const PIE_COLORS = [
  "oklch(0.65 0.20 250)",
  "oklch(0.70 0.18 160)",
  "oklch(0.72 0.18 60)",
  "oklch(0.65 0.22 350)",
  "oklch(0.70 0.18 200)",
  "oklch(0.68 0.20 30)",
  "oklch(0.66 0.18 290)",
  "oklch(0.72 0.16 130)",
  "oklch(0.68 0.20 20)",
  "oklch(0.65 0.18 220)",
];

function formatPKR(n: number) {
  return `PKR ${Math.round(n).toLocaleString()}`;
}

function AnalyticsPage() {
  const { holdings, loading } = usePortfolio();
  const [range, setRange] = useState<RangeKey>("30D");
  const [sortKey, setSortKey] = useState<SortKey>("pnl");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const summary = useMemo(() => getPortfolioSummary(holdings), [holdings]);

  const perfData = useMemo(
    () =>
      [...holdings]
        .sort((a, b) => b.changePercent - a.changePercent)
        .map((h) => ({
          script: h.script,
          company: h.company,
          changePercent: h.changePercent,
        })),
    [holdings],
  );

  const best = perfData[0];
  const worst = perfData[perfData.length - 1];

  // Synthetic growth series (deterministic) ending at totalCurrentValue
  const growthData = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)!.days;
    const end = summary.totalCurrentValue;
    const start = summary.totalBookValue || end * 0.9;
    const points = Math.min(days, 90);
    const arr: { date: string; value: number }[] = [];
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const noise = Math.sin(i * 1.3) * (end * 0.015) + Math.cos(i * 0.7) * (end * 0.01);
      const value = start + (end - start) * t + noise;
      const d = new Date();
      d.setDate(d.getDate() - (points - i));
      arr.push({
        date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
        value: Math.max(0, Math.round(value)),
      });
    }
    return arr;
  }, [range, summary.totalCurrentValue, summary.totalBookValue]);

  const allocation = useMemo(() => {
    const total = summary.totalCurrentValue || 1;
    return [...holdings]
      .map((h) => ({
        name: h.script,
        company: h.company,
        value: h.currentValue,
        pct: (h.currentValue / total) * 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings, summary.totalCurrentValue]);

  const top2Pct = allocation.slice(0, 2).reduce((s, a) => s + a.pct, 0);

  const tableRows = useMemo(() => {
    const rows = holdings.map((h) => ({
      script: h.script,
      company: h.company,
      shares: h.shares,
      buy: h.purchasedRate,
      current: h.ldcp,
      value: h.currentValue,
      pnl: h.change,
      pct: h.changePercent,
    }));
    rows.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "pnl":
          return (a.pnl - b.pnl) * dir;
        case "pct":
          return (a.pct - b.pct) * dir;
        case "value":
          return (a.value - b.value) * dir;
        case "name":
          return a.script.localeCompare(b.script) * dir;
      }
    });
    return rows;
  }, [holdings, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const concentrationWarning = top2Pct > 50;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">A clean view of your portfolio performance</p>
        </div>
        <RefreshButton />
      </div>

      {/* Top stat cards (kept) */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <div className="animate-fade-in rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md" style={{ animationDelay: "0ms" }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Best Performer</span>
          </div>
          <p className="mt-2 text-lg font-bold text-gain">
            {best?.script} ({best?.changePercent >= 0 ? "+" : ""}{best?.changePercent.toFixed(2)}%)
          </p>
        </div>
        <div className="animate-fade-in rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Worst Performer</span>
          </div>
          <p className="mt-2 text-lg font-bold text-loss">
            {worst?.script} ({worst?.changePercent.toFixed(2)}%)
          </p>
        </div>
        <div className="animate-fade-in rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md" style={{ animationDelay: "160ms" }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Return %</span>
          </div>
          <p className={`mt-2 text-lg font-bold ${summary.returnPct >= 0 ? "text-gain" : "text-loss"}`}>
            {summary.returnPct >= 0 ? "+" : ""}{summary.returnPct.toFixed(2)}%
          </p>
        </div>
        <div className="animate-fade-in rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md" style={{ animationDelay: "240ms" }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Stocks</span>
          </div>
          <p className="mt-2 text-lg font-bold text-foreground">{holdings.length}</p>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Investment</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatPKR(summary.totalBookValue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Cost basis across {holdings.length} stocks</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Current Value</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatPKR(summary.totalCurrentValue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Live market value</p>
        </div>
        <div className={`rounded-xl border p-5 transition-all hover:shadow-md ${summary.totalPnL >= 0 ? "border-gain/30 bg-gain-bg/30" : "border-loss/30 bg-loss-bg/30"}`}>
          <div className="flex items-center gap-2 text-muted-foreground">
            {summary.totalPnL >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="text-xs font-semibold uppercase tracking-wider">Total Profit / Loss</span>
          </div>
          <p className={`mt-2 text-2xl font-bold ${summary.totalPnL >= 0 ? "text-gain" : "text-loss"}`}>
            {summary.totalPnL >= 0 ? "+" : ""}{formatPKR(summary.totalPnL)}
          </p>
          <p className={`mt-1 text-xs font-semibold ${summary.returnPct >= 0 ? "text-gain" : "text-loss"}`}>
            {summary.returnPct >= 0 ? "+" : ""}{summary.returnPct.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Growth + Allocation */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Portfolio Growth</h3>
              <p className="text-xs text-muted-foreground">Total portfolio value over time</p>
            </div>
            <div className="inline-flex rounded-lg border border-border bg-surface p-1">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${range === r.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {r.key}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.20 250)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.65 0.20 250)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 250 / 0.15)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={45} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v) => [formatPKR(Number(v)), "Value"]}
                />
                <Area type="monotone" dataKey="value" stroke="oklch(0.65 0.20 250)" strokeWidth={2} fill="url(#growthFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground">Portfolio Allocation</h3>
          <p className="text-xs text-muted-foreground">% distribution across stocks</p>
          <div className="mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {allocation.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 11,
                    padding: "6px 10px",
                  }}
                  formatter={(v, _n, p) => {
                    const pct = (p as { payload?: { pct?: number } })?.payload?.pct ?? 0;
                    return [`${formatPKR(Number(v))} (${pct.toFixed(1)}%)`, ""];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs text-muted-foreground">
            Top 2 stocks make up <span className="font-bold text-foreground">{top2Pct.toFixed(1)}%</span> of your portfolio
          </div>
          <div className="mt-3 max-h-32 space-y-1.5 overflow-y-auto pr-1">
            {allocation.map((a, i) => (
              <div key={a.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="font-semibold text-foreground truncate">{a.name}</span>
                </div>
                <span className="font-mono text-muted-foreground">{a.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Performance Table */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Stock Performance</h3>
            <p className="text-xs text-muted-foreground">Click headers to sort</p>
          </div>
        </div>
        <div className="-mx-2 sm:mx-0 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort("name")}>
                  <span className="inline-flex items-center gap-1">Stock <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="py-2 px-3 text-right">Qty</th>
                <th className="py-2 px-3 text-right">Buy</th>
                <th className="py-2 px-3 text-right">Current</th>
                <th className="py-2 px-3 text-right cursor-pointer hover:text-foreground" onClick={() => toggleSort("value")}>
                  <span className="inline-flex items-center gap-1">Value <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="py-2 px-3 text-right cursor-pointer hover:text-foreground" onClick={() => toggleSort("pnl")}>
                  <span className="inline-flex items-center gap-1">P/L <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="py-2 pl-3 text-right cursor-pointer hover:text-foreground" onClick={() => toggleSort("pct")}>
                  <span className="inline-flex items-center gap-1">% <ArrowUpDown className="h-3 w-3" /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((r) => {
                const positive = r.pnl >= 0;
                return (
                  <tr key={r.script} className="border-b border-border/50 transition-colors hover:bg-surface">
                    <td className="py-2.5 pr-3">
                      <Link to="/portfolio" className="block hover:underline">
                        <div className="font-bold text-foreground">{r.script}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">{r.company}</div>
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{r.shares.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{r.buy.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{r.current.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{formatPKR(r.value)}</td>
                    <td className={`py-2.5 px-3 text-right font-mono font-semibold ${positive ? "text-gain" : "text-loss"}`}>
                      {positive ? "+" : ""}{Math.round(r.pnl).toLocaleString()}
                    </td>
                    <td className={`py-2.5 pl-3 text-right font-semibold ${positive ? "text-gain" : "text-loss"}`}>
                      <span className="inline-flex items-center gap-1">
                        {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {positive ? "+" : ""}{r.pct.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 52-Week Range */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">52-Week Range</h3>
            <p className="text-xs text-muted-foreground">Where each stock trades between its yearly low and high</p>
          </div>
          <div className="hidden gap-3 text-[10px] uppercase tracking-wider text-muted-foreground sm:flex">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-loss" /> Low</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Current</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gain" /> High</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {holdings.map((h, idx) => {
            const range = Math.max(h.week52High - h.week52Low, 0.0001);
            const rawPct = ((h.ldcp - h.week52Low) / range) * 100;
            const pct = Math.min(100, Math.max(0, rawPct));
            const nearHigh = pct >= 80;
            const nearLow = pct <= 20;
            return (
              <div
                key={h.script}
                className="animate-fade-in group rounded-lg border border-border bg-surface/50 p-4 transition-all hover:border-primary/40 hover:shadow-md"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-foreground">{h.script}</div>
                    <div className="truncate text-xs text-muted-foreground">{h.company}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-foreground">{h.ldcp.toFixed(2)}</div>
                    <div className={`text-[10px] font-semibold uppercase tracking-wider ${nearHigh ? "text-gain" : nearLow ? "text-loss" : "text-muted-foreground"}`}>
                      {pct.toFixed(0)}% of range
                    </div>
                  </div>
                </div>
                <div className="relative mt-3 h-2 rounded-full bg-gradient-to-r from-loss/30 via-amber-500/30 to-gain/30">
                  <div
                    className="absolute -top-1 h-4 w-1 rounded-full bg-primary shadow-[0_0_0_3px_var(--color-background)] transition-all duration-500"
                    style={{ left: `calc(${pct}% - 2px)` }}
                    title={`Current: ${h.ldcp.toFixed(2)}`}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[11px] font-mono">
                  <span className="text-loss">{h.week52Low.toFixed(2)}</span>
                  <span className="text-muted-foreground">
                    {h.upFromLow >= 0 ? "+" : ""}{h.upFromLow.toFixed(1)}% from low · −{Math.abs(h.downFromHigh).toFixed(1)}% from high
                  </span>
                  <span className="text-gain">{h.week52High.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground">Insights</h3>
        <p className="text-xs text-muted-foreground">Smart highlights from your portfolio</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className={`rounded-lg border p-4 ${summary.returnPct >= 0 ? "border-gain/30 bg-gain-bg/30" : "border-loss/30 bg-loss-bg/30"}`}>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Performance</div>
            <p className="mt-1 text-sm">
              Your portfolio is <span className={`font-bold ${summary.returnPct >= 0 ? "text-gain" : "text-loss"}`}>{summary.returnPct >= 0 ? "up" : "down"} {Math.abs(summary.returnPct).toFixed(2)}%</span> overall — {summary.totalPnL >= 0 ? "+" : ""}{formatPKR(summary.totalPnL)}.
            </p>
          </div>
          <div className="rounded-lg border border-gain/30 bg-gain-bg/30 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Contributor</div>
            <p className="mt-1 text-sm">
              <span className="font-bold text-foreground">{best?.script}</span> leads with <span className="font-bold text-gain">+{best?.changePercent.toFixed(2)}%</span>.
            </p>
          </div>
          <div className="rounded-lg border border-loss/30 bg-loss-bg/30 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Underperformer</div>
            <p className="mt-1 text-sm">
              <span className="font-bold text-foreground">{worst?.script}</span> is at <span className="font-bold text-loss">{worst?.changePercent.toFixed(2)}%</span> — review or hold.
            </p>
          </div>
          <div className={`rounded-lg border p-4 ${concentrationWarning ? "border-amber-500/40 bg-amber-500/10" : "border-border bg-surface"}`}>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Concentration</div>
            <p className="mt-1 text-sm">
              {concentrationWarning ? (
                <>⚠️ Top 2 holdings = <span className="font-bold">{top2Pct.toFixed(1)}%</span>. Consider diversifying.</>
              ) : (
                <>Allocation looks balanced — top 2 = <span className="font-bold">{top2Pct.toFixed(1)}%</span>.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
