import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchPortfolioData, type StockHolding } from "@/lib/google-sheets";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type PortfolioSearch = { highlight?: string };

export const Route = createFileRoute("/portfolio")({
  validateSearch: (search: Record<string, unknown>): PortfolioSearch => ({
    highlight: typeof search.highlight === "string" ? search.highlight : undefined,
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { highlight } = Route.useSearch();
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData()
      .then(setHoldings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalCurrent = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalBook = holdings.reduce((s, h) => s + h.bookValue, 0);
  const totalChange = totalCurrent - totalBook;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
        <p className="text-sm text-muted-foreground">Detailed view of all holdings</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
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
            {holdings.map((h) => (
              <tr
                key={h.script}
                id={`row-${h.script}`}
                className="border-b border-border transition-colors hover:bg-surface-hover"
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
              <td className="px-4 py-3 text-right font-mono">{holdings.reduce((s, h) => s + h.shares, 0)}</td>
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
    </div>
  );
}
