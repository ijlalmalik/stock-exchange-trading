import { useEffect, useState } from "react";
import { Activity, ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KSE100Data {
  current: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  timestamp: string;
}

export function KSE100Ticker() {
  const [data, setData] = useState<KSE100Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKSE100 = async () => {
    try {
      const res = await fetch("https://dps.psx.com.pk/timeseries/int/KSE100");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      const points: [number, number, number][] = json.data || [];
      if (points.length === 0) throw new Error("No data");

      const current = points[0][1];
      const totalVolume = points.reduce((s, p) => s + (p[2] || 0), 0);
      const prices = points.map((p) => p[1]);
      const high = Math.max(...prices);
      const low = Math.min(...prices);

      // Previous close = we estimate from first entry of previous trading session
      // The PSX data shows today's intraday, so previousClose = current - change
      // We can estimate from the last point (earliest today) being close to previous close
      const previousClose = points[points.length - 1][1];
      const change = current - previousClose;
      const changePct = previousClose > 0 ? (change / previousClose) * 100 : 0;

      const ts = new Date(points[0][0] * 1000);
      const timestamp = ts.toLocaleString("en-PK", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      setData({ current, change, changePct, high, low, volume: totalVolume, previousClose, timestamp });
      setError(null);
    } catch (e) {
      setError("Unable to load live data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKSE100();
    const interval = setInterval(fetchKSE100, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const isUp = data ? data.change > 0 : false;
  const isDown = data ? data.change < 0 : false;

  return (
    <div className="animate-fade-in rounded-xl border border-border bg-card p-5 transition-all duration-500">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">KSE 100 Index</h3>
          <span className="inline-flex h-2 w-2 rounded-full bg-gain animate-pulse" />
          <span className="text-[10px] text-gain font-medium">LIVE</span>
        </div>
        <div className="flex items-center gap-2">
          {data && <span className="text-[10px] text-muted-foreground">As of {data.timestamp}</span>}
          <a
            href="https://dps.psx.com.pk/indices"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <p className="py-4 text-center text-xs text-muted-foreground">{error}</p>
      ) : data ? (
        <div className="space-y-4">
          {/* Main value & change */}
          <div className="flex items-baseline gap-4">
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {data.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className={`flex items-center gap-1.5 ${isUp ? "text-gain" : isDown ? "text-loss" : "text-muted-foreground"}`}>
              {isUp ? <TrendingUp className="h-4 w-4" /> : isDown ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              <span className="text-lg font-semibold">
                {isUp ? "▲" : isDown ? "▼" : "–"} {Math.abs(data.change).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-sm font-medium">
                ({Math.abs(data.changePct).toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* High, Low, Volume, Prev Close */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg bg-surface px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">High</p>
              <p className="mt-0.5 text-base font-bold tracking-tight text-foreground">
                {data.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-lg bg-surface px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Low</p>
              <p className="mt-0.5 text-base font-bold tracking-tight text-foreground">
                {data.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-lg bg-surface px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Volume</p>
              <p className="mt-0.5 text-base font-bold tracking-tight text-foreground">
                {(data.volume / 1e6).toFixed(2)}M
              </p>
            </div>
            <div className="rounded-lg bg-surface px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Prev Close</p>
              <p className="mt-0.5 text-base font-bold tracking-tight text-foreground">
                {data.previousClose.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
