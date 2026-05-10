import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { usePortfolio } from "@/lib/portfolio-store";
import { ArrowUpRight, ArrowDownRight, Search, LayoutGrid, List, X } from "lucide-react";
import { RefreshButton } from "@/components/RefreshButton";
import { HoldingsManager } from "@/components/HoldingsManager";
import { MainSheetButton } from "@/components/MainSheetButton";

type PortfolioSearch = { highlight?: string };

export const Route = createFileRoute("/portfolio")({
  validateSearch: (search: Record<string, unknown>): PortfolioSearch => ({
    highlight: typeof search.highlight === "string" ? search.highlight : undefined,
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { highlight } = Route.useSearch();
  const { holdings, loading } = usePortfolio();
  const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return "grid";
    return "list";
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (highlight && !loading) {
      const el = document.getElementById(`row-${highlight}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary");
        setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 3000);
      }
    }
  }, [highlight, loading]);

  const filtered = holdings.filter(
    (h) =>
      h.script.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalCurrent = filtered.reduce((s, h) => s + h.currentValue, 0);
  const totalBook = filtered.reduce((s, h) => s + h.bookValue, 0);
  const totalChange = totalCurrent - totalBook;

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Detailed view of all holdings</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <HoldingsManager />
          <MainSheetButton />
          <RefreshButton />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">{filtered.length} holdings</div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full sm:w-56 rounded-lg border border-border bg-surface pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {/* View toggle */}
          <div className="flex rounded-lg border border-border bg-surface">
            <button
              onClick={() => setViewMode("list")}
              className={`flex h-9 w-9 items-center justify-center rounded-l-lg transition-all duration-200 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex h-9 w-9 items-center justify-center rounded-r-lg transition-all duration-200 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="animate-fade-in flex h-40 items-center justify-center rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">No stocks found matching "{searchQuery}"</p>
        </div>
      ) : viewMode === "list" ? (
        <div className="animate-fade-in -mx-3 sm:mx-0 overflow-x-auto rounded-none sm:rounded-xl border-y sm:border border-border bg-card">
          <table className="w-full min-w-[900px] text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Script</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shares</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">LDCP</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Cost</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Val</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Book Val</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">P&L</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Change %</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">52W Low</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">52W High</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">% Up Low</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">% Down High</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, idx) => (
                <tr
                  key={h.script}
                  id={`row-${h.script}`}
                  className="border-b border-border transition-all duration-200 hover:bg-surface-hover"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <td className="px-4 py-3 text-muted-foreground">{h.no}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{h.script}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">{h.company}</td>
                  <td className="px-4 py-3 text-right font-mono">{h.shares}</td>
                  <td className="px-4 py-3 text-right font-mono">{h.ldcp.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono">{h.purchasedRate.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono">{h.currentValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono">{h.bookValue.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${h.change >= 0 ? "text-gain" : "text-loss"}`}>
                    <span className="inline-flex items-center gap-1">
                      {h.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {h.change.toLocaleString()}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${h.changePercent >= 0 ? "text-gain" : "text-loss"}`}>
                    {h.changePercent >= 0 ? "+" : ""}{h.changePercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{h.week52Low.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{h.week52High.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-gain">{h.upFromLow.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right font-mono text-loss">{h.downFromHigh.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface font-semibold">
                <td className="px-4 py-3" colSpan={3}>Total</td>
                <td className="px-4 py-3 text-right font-mono">{filtered.reduce((s, h) => s + h.shares, 0)}</td>
                <td className="px-4 py-3" colSpan={2} />
                <td className="px-4 py-3 text-right font-mono">{totalCurrent.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono">{totalBook.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right font-mono ${totalChange >= 0 ? "text-gain" : "text-loss"}`}>{totalChange.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right font-mono ${totalChange >= 0 ? "text-gain" : "text-loss"}`}>
                  {totalBook > 0 ? ((totalChange / totalBook) * 100).toFixed(2) : "0.00"}%
                </td>
                <td className="px-4 py-3" colSpan={4} />
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h, idx) => (
            <div
              key={h.script}
              id={`row-${h.script}`}
              className="animate-fade-in rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-foreground">{h.script}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">{h.company}</p>
                </div>
                <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${h.change >= 0 ? "bg-gain-bg text-gain" : "bg-loss-bg text-loss"}`}>
                  {h.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {h.changePercent >= 0 ? "+" : ""}{h.changePercent.toFixed(2)}%
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Shares</p>
                  <p className="font-mono font-medium text-foreground">{h.shares}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">LDCP</p>
                  <p className="font-mono font-medium text-foreground">{h.ldcp.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Val</p>
                  <p className="font-mono font-medium text-foreground">{h.currentValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">P&L</p>
                  <p className={`font-mono font-semibold ${h.change >= 0 ? "text-gain" : "text-loss"}`}>{h.change.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">52W Range</p>
                  <p className="font-mono font-medium text-foreground">{h.week52Low.toFixed(0)} - {h.week52High.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Cost</p>
                  <p className="font-mono font-medium text-foreground">{h.purchasedRate.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
