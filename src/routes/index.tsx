import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Wallet, BookOpen, TrendingUp, Percent } from "lucide-react";
import { fetchPortfolioData, getPortfolioSummary, type StockHolding } from "@/lib/google-sheets";
import { StatCard } from "@/components/StatCard";
import { PnLChart } from "@/components/PnLChart";
import { AllocationChart } from "@/components/AllocationChart";
import { TopMovers } from "@/components/TopMovers";
import { KSE100Ticker } from "@/components/KSE100Ticker";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
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
  const pnlVariant = summary.totalPnL >= 0 ? "gain" : "loss";

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your portfolio performance</p>
      </div>

      {/* KSE100 Ticker */}
      <KSE100Ticker />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Portfolio Value"
          value={`PKR ${summary.totalCurrentValue.toLocaleString()}`}
          subtitle={`${summary.totalShares} shares • ${summary.stockCount} stocks`}
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          title="Book Value"
          value={`PKR ${summary.totalBookValue.toLocaleString()}`}
          subtitle={`${summary.totalShares} shares • ${summary.stockCount} stocks`}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Total P&L"
          value={`PKR ${summary.totalPnL.toLocaleString()}`}
          subtitle={`${summary.totalShares} shares • ${summary.stockCount} stocks`}
          icon={<TrendingUp className="h-4 w-4" />}
          variant={pnlVariant}
        />
        <StatCard
          title="Return %"
          value={`${summary.returnPct.toFixed(2)}%`}
          subtitle={`${summary.totalShares} shares • ${summary.stockCount} stocks`}
          icon={<Percent className="h-4 w-4" />}
          variant={pnlVariant}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <AllocationChart holdings={holdings} />
        <PnLChart holdings={holdings} />
      </div>

      {/* Top Movers */}
      <TopMovers holdings={holdings} />
    </div>
  );
}
