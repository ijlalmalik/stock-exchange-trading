import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowDown, ArrowUp, ArrowUpDown, BarChart3, Target, TrendingDown, Wallet } from "lucide-react";
import { getPortfolioSummary } from "@/lib/google-sheets";
import { usePortfolio } from "@/lib/portfolio-store";
import { RefreshButton } from "@/components/RefreshButton";
import { MainSheetButton } from "@/components/MainSheetButton";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

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
  return `PKR ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function AnalyticsPage() {
  const { holdings, loading, psxTimestamp } = usePortfolio();
  const [sortKey, setSortKey] = useState<SortKey>("pnl");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const summary = useMemo(() => getPortfolioSummary(holdings), [holdings]);

  const perfData = useMemo(
    () =>
      [...holdings]
        .sort((a, b) => b.changePercent - a.changePercent)
        .map((h) => ({ script: h.script, changePercent: h.changePercent })),
    [holdings],
  );

  const allSame =
    perfData.length === 0 || perfData.every((p) => p.changePercent === perfData[0].changePercent);
  const best = allSame ? null : perfData[0];
  const worst = allSame ? null : perfData[perfData.length - 1];

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

  return (
    <div className="mx-auto w-full max-w-full animate-fade-in space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            PSX data — delayed by 5 minutes{psxTimestamp ? ` • Updated: ${psxTimestamp}` : ""}
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          <MainSheetButton />
          <RefreshButton />
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:gap-4 md:grid-cols-4">
        <div className="animate-fade-in rounded-xl border border-border bg-card p-3.5 sm:p-4 transition-all hover:shadow-md">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4 shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Best Performer</span>
          </div>
          <p className="mt-2 text-sm sm:text-lg font-bold text-gain break-words">
            {best ? `${best.script} (${best.changePercent >= 0 ? "+" : ""}${best.changePercent.toFixed(2)}%)` : "—"}
          </p>
        </div>
        <div className="animate-fade-in rounded-xl border border-border bg-card p-3.5 sm:p-4 transition-all hover:shadow-md">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingDown className="h-4 w-4 shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Worst Performer</span>
          </div>
          <p className="mt-2 text-sm sm:text-lg font-bold text-loss break-words">
            {worst ? `${worst.script} (${worst.changePercent.toFixed(2)}%)` : "—"}
          </p>
        </div>
        <div className="animate-fade-in rounded-xl border border-border bg-card p-3.5 sm:p-4 transition-all hover:shadow-md">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="h-4 w-4 shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Current Portfolio Value</span>
          </div>
          <p className="mt-2 text-sm sm:text-lg font-bold text-foreground break-words">{formatPKR(summary.totalCurrentValue)}</p>
        </div>
        <div className="animate-fade-in rounded-xl border border-border bg-card p-3.5 sm:p-4 transition-all hover:shadow-md">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Total Stocks</span>
          </div>
          <p className="mt-2 text-sm sm:text-lg font-bold text-foreground">{holdings.length}</p>
        </div>
      </div>

      {/* Allocation */}
      <div className="rounded-xl border border-border bg-card p-3.5 sm:p-5">
        <h3 className="text-sm font-bold text-foreground">Portfolio Allocation</h3>
        <p className="text-xs text-muted-foreground">% distribution across stocks</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[260px_1fr] lg:items-center">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
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
                    return [`${formatPKR(Number(v))} (${pct.toFixed(2)}%)`, ""];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {allocation.map((a, i) => (
              <div key={a.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="font-semibold text-foreground truncate">{a.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted-foreground">{formatPKR(a.value)}</span>
                  <span className="min-w-[60px] text-right font-mono font-bold text-foreground">{a.pct.toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Performance */}
      <div className="rounded-xl border border-border bg-card p-3.5 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Stock Performance</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">Click headers to sort</p>
          </div>
          <div className="flex sm:hidden gap-1">
            {(["pnl", "pct", "value", "name"] as const).map((k) => (
              <button
                key={k}
                onClick={() => toggleSort(k)}
                className={`btn-tight rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                  sortKey === k ? "border-primary/50 bg-primary/15 text-primary" : "border-border bg-surface text-muted-foreground"
                }`}
              >
                {k.toUpperCase()}{sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="grid gap-2 sm:hidden">
          {tableRows.map((r) => {
            const positive = r.pnl >= 0;
            return (
              <Link key={r.script} to="/portfolio" search={{ highlight: r.script }} className="block rounded-lg border border-border bg-surface/50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground">{r.script}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{r.company}</div>
                  </div>
                  <div className={`shrink-0 text-right font-mono text-sm font-semibold ${positive ? "text-gain" : "text-loss"}`}>
                    <div className="inline-flex items-center gap-1">
                      {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {positive ? "+" : ""}{r.pct.toFixed(2)}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">{positive ? "+" : ""}{r.pnl.toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 text-[11px] min-[360px]:grid-cols-3">
                  <div>
                    <p className="text-muted-foreground">Qty</p>
                    <p className="font-mono text-foreground">{r.shares.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Price</p>
                    <p className="font-mono text-foreground">{r.current.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Value</p>
                    <p className="font-mono text-foreground">{formatPKR(r.value)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort("name")}>
                  <span className="inline-flex items-center gap-1">Stock <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="py-2 px-3 text-right">Qty</th>
                <th className="py-2 px-3 text-right">Avg Cost</th>
                <th className="py-2 px-3 text-right">Current Price</th>
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
                      <Link to="/portfolio" search={{ highlight: r.script }} className="block hover:underline">
                        <div className="font-bold text-foreground">{r.script}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">{r.company}</div>
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{r.shares.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{r.buy.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{r.current.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{formatPKR(r.value)}</td>
                    <td className={`py-2.5 px-3 text-right font-mono font-semibold ${positive ? "text-gain" : "text-loss"}`}>
                      {positive ? "+" : ""}{r.pnl.toFixed(2)}
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
    </div>
  );
}
