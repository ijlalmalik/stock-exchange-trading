import { useEffect, useState } from "react";
import { Activity, ExternalLink, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { getKSE100Snapshot, type KSE100Snapshot } from "@/lib/psx";

export function KSE100Ticker() {
  const [data, setData] = useState<KSE100Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKSE100 = async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const snapshot = await getKSE100Snapshot();
      setData(snapshot);
      setError(null);
    } catch {
      setError("Unable to load live data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchKSE100(true);
    const interval = setInterval(() => {
      void fetchKSE100();
    }, 60000);
    const onRefresh = () => void fetchKSE100();
    window.addEventListener("portfolio:refresh", onRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("portfolio:refresh", onRefresh);
    };
  }, []);

  const isUp = data ? data.change > 0 : false;
  const isDown = data ? data.change < 0 : false;

  return (
    <div className="animate-fade-in rounded-xl border border-border bg-card p-3.5 sm:p-5 transition-all duration-500">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">KSE 100 Index</h3>
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-gain" />
          <span className="text-[10px] font-medium text-gain">LIVE</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data && <span className="text-[10px] text-muted-foreground">As of {data.timestamp}</span>}
          <a
            href="https://dps.psx.com.pk/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-all duration-300 hover:bg-surface-hover hover:text-foreground"
          >
            Open PSX
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : data ? (
        <div className="space-y-3 sm:space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">Pakistan Stock Exchange</p>
                <p className="mt-2 break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {data.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`inline-flex w-fit items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold ${isUp ? "bg-gain-bg text-gain" : isDown ? "bg-loss-bg text-loss" : "bg-muted text-muted-foreground"}`}>
                {isUp ? <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : isDown ? <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                <span>
                  {isUp ? "+" : isDown ? "-" : ""}
                  {Math.abs(data.change).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span>({Math.abs(data.changePct).toFixed(2)}%)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="min-w-0 rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Day High</p>
              <p className="mt-1 break-words text-lg font-bold tracking-tight text-foreground">
                {data.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="min-w-0 rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Day Low</p>
              <p className="mt-1 break-words text-lg font-bold tracking-tight text-foreground">
                {data.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="min-w-0 rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Previous Close</p>
              <p className="mt-1 break-words text-lg font-bold tracking-tight text-foreground">
                {data.previousClose.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {error ? <p className="text-[11px] text-muted-foreground">Showing the latest available PSX snapshot.</p> : null}
        </div>
      ) : error ? (
        <div className="space-y-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">{error}</p>
          <a
            href="https://dps.psx.com.pk/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-all duration-300 hover:bg-surface-hover hover:text-foreground"
          >
            Open PSX
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : null}
    </div>
  );
}
