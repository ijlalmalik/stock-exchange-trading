import { createFileRoute } from "@tanstack/react-router";
import { Wallet, BookOpen, TrendingUp, Percent } from "lucide-react";
import { getPortfolioSummary } from "@/lib/google-sheets";
import { usePortfolio } from "@/lib/portfolio-store";
import { StatCard } from "@/components/StatCard";
import { PnLChart } from "@/components/PnLChart";
import { AllocationChart } from "@/components/AllocationChart";
import { TopMovers } from "@/components/TopMovers";
import { KSE100Ticker } from "@/components/KSE100Ticker";
import { RefreshButton } from "@/components/RefreshButton";
import { HoldingsManager } from "@/components/HoldingsManager";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const { holdings, loading } = usePortfolio();

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your portfolio performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <HoldingsManager />
          <RefreshButton />
        </div>
      </div>

      <KSE100Ticker />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Portfolio Value" value={`PKR ${summary.totalCurrentValue.toLocaleString()}`} subtitle={`${summary.totalShares} shares • ${summary.stockCount} stocks`} icon={<Wallet className="h-4 w-4" />} />
        <StatCard title="Book Value" value={`PKR ${summary.totalBookValue.toLocaleString()}`} subtitle={`${summary.totalShares} shares • ${summary.stockCount} stocks`} icon={<BookOpen className="h-4 w-4" />} />
        <StatCard title="Total P&L" value={`PKR ${summary.totalPnL.toLocaleString()}`} subtitle={`${summary.totalShares} shares • ${summary.stockCount} stocks`} icon={<TrendingUp className="h-4 w-4" />} variant={pnlVariant} />
        <StatCard title="Return %" value={`${summary.returnPct.toFixed(2)}%`} subtitle={`${summary.totalShares} shares • ${summary.stockCount} stocks`} icon={<Percent className="h-4 w-4" />} variant={pnlVariant} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AllocationChart holdings={holdings} />
        <PnLChart holdings={holdings} />
      </div>

      <TopMovers holdings={holdings} />
    </div>
  );
}
