import { createFileRoute } from "@tanstack/react-router";
import { Wallet, BookOpen, TrendingUp, Percent } from "lucide-react";
import { getPortfolioSummary } from "@/lib/google-sheets";
import { usePortfolio } from "@/lib/portfolio-store";
import { StatCard } from "@/components/StatCard";
import { PnLChart } from "@/components/PnLChart";
import { TopMovers } from "@/components/TopMovers";
import { KSE100Ticker } from "@/components/KSE100Ticker";
import { RefreshButton } from "@/components/RefreshButton";
import { HoldingsManager } from "@/components/HoldingsManager";
import { MainSheetButton } from "@/components/MainSheetButton";

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
    <div className="mx-auto w-full max-w-full animate-fade-in space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Overview of your portfolio performance</p>
        </div>
        <div className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          <HoldingsManager />
          <MainSheetButton />
          <RefreshButton />
        </div>
      </div>

      <KSE100Ticker />

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <StatCard title="Portfolio Value" value={`PKR ${summary.totalCurrentValue.toLocaleString()}`} subtitle={`${summary.totalShares} shares • ${summary.stockCount} stocks`} icon={<Wallet className="h-4 w-4" />} />
        <StatCard title="Book Value" value={`PKR ${summary.totalBookValue.toLocaleString()}`} subtitle={`${summary.totalShares} shares • ${summary.stockCount} stocks`} icon={<BookOpen className="h-4 w-4" />} />
        <StatCard title="Total P&L" value={`PKR ${summary.totalPnL.toLocaleString()}`} subtitle="vs book value" icon={<TrendingUp className="h-4 w-4" />} variant={pnlVariant} />
        <StatCard title="Return %" value={`${summary.returnPct.toFixed(2)}%`} subtitle="since purchase" icon={<Percent className="h-4 w-4" />} variant={pnlVariant} />
      </div>

      <PnLChart holdings={holdings} />

      <TopMovers holdings={holdings} />
    </div>
  );
}
