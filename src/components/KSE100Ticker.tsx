import { useEffect, useState } from "react";
import { Activity, ExternalLink } from "lucide-react";

interface IndexData {
  name: string;
  value: string;
  change: string;
  changePct: string;
}

const INDICES: IndexData[] = [
  { name: "KSE100", value: "168,519.94", change: "0.00", changePct: "0.00%" },
  { name: "KSE30", value: "50,918.36", change: "0.00", changePct: "0.00%" },
  { name: "KMI30", value: "243,647.50", change: "0.00", changePct: "0.00%" },
  { name: "ALLSHR", value: "100,327.69", change: "0.00", changePct: "0.00%" },
];

export function KSE100Ticker() {
  const [indices, setIndices] = useState<IndexData[]>(INDICES);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }));
    // In production, we'd fetch live data from a proxy. Using scraped static data for now.
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">PSX Market Indices</h3>
          <span className="inline-flex h-2 w-2 rounded-full bg-gain animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && <span className="text-[10px] text-muted-foreground">Updated {lastUpdate}</span>}
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
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {indices.map((idx) => {
          const changeNum = parseFloat(idx.change.replace(/,/g, ""));
          const isUp = changeNum > 0;
          const isDown = changeNum < 0;
          return (
            <div key={idx.name} className="rounded-lg bg-surface px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{idx.name}</p>
              <p className="mt-0.5 text-lg font-bold tracking-tight text-foreground">{idx.value}</p>
              <p className={`text-xs font-mono ${isUp ? "text-gain" : isDown ? "text-loss" : "text-muted-foreground"}`}>
                {isUp ? "▲" : isDown ? "▼" : "–"} {idx.change} ({idx.changePct})
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
