import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Search, X, Radio } from "lucide-react";
import { RefreshButton } from "@/components/RefreshButton";
import { API_KEY, SHEET_ID } from "@/lib/google-sheets";

interface LDCPEntry {
  symbol: string;
  company: string;
  price: number;
  idxWt: number;
  ffShares: number;
  ffMcap: number;
  ordShares: number;
  ordMcap: number;
  volume: number;
}


function parseNum(val: string): number {
  if (!val) return 0;
  return parseFloat(val.toString().replace(/[,%]/g, "").trim()) || 0;
}

async function fetchLDCPData(): Promise<LDCPEntry[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/LDCP!A2:I1000?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch LDCP data");
  const json = await res.json();
  const rows: string[][] = json.values || [];
  return rows
    .filter((r) => r[0] && r[2])
    .map((r) => ({
      symbol: r[0] || "",
      company: r[1] || "",
      price: parseNum(r[2]),
      idxWt: parseNum(r[3]),
      ffShares: parseNum(r[4]),
      ffMcap: parseNum(r[5]),
      ordShares: parseNum(r[6]),
      ordMcap: parseNum(r[7]),
      volume: parseNum(r[8]),
    }));
}

export const Route = createFileRoute("/ldcp")({
  component: LDCPPage,
});

function LDCPPage() {
  const [data, setData] = useState<LDCPEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"symbol" | "price" | "volume" | "idxWt">("symbol");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [visibleCount, setVisibleCount] = useState(100);

  const load = useCallback(() => {
    fetchLDCPData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener("portfolio:refresh", onRefresh);
    return () => window.removeEventListener("portfolio:refresh", onRefresh);
  }, [load]);

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir(col === "symbol" ? "asc" : "desc");
    }
  };

  const filtered = data
    .filter(
      (d) =>
        d.symbol.toLowerCase().includes(search.toLowerCase()) ||
        d.company.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortBy === "symbol") return a.symbol.localeCompare(b.symbol) * mul;
      return ((a[sortBy] as number) - (b[sortBy] as number)) * mul;
    });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const sortIcon = (col: typeof sortBy) =>
    sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">LDCP Live</h1>
            <span className="inline-flex h-2 w-2 rounded-full bg-gain animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">{data.length} symbols — Last Day Closing Prices from PSX</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search symbol or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full sm:w-64 rounded-lg border border-border bg-surface pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <RefreshButton />
        </div>
      </div>

      <div className="-mx-3 sm:mx-0 overflow-x-auto rounded-none sm:rounded-xl border-y sm:border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th onClick={() => handleSort("symbol")} className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                Symbol{sortIcon("symbol")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</th>
              <th onClick={() => handleSort("price")} className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                Price{sortIcon("price")}
              </th>
              <th onClick={() => handleSort("idxWt")} className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                IDX WT %{sortIcon("idxWt")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">FF MCap</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ord MCap</th>
              <th onClick={() => handleSort("volume")} className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                Volume{sortIcon("volume")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, visibleCount).map((d) => (
              <tr
                key={d.symbol}
                className="border-b border-border transition-all duration-200 hover:bg-surface-hover"
              >
                <td className="px-4 py-2.5 font-bold text-foreground">{d.symbol}</td>
                <td className="px-4 py-2.5 max-w-[250px] truncate text-muted-foreground">{d.company}</td>
                <td className="px-4 py-2.5 text-right font-mono text-foreground">{d.price.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{d.idxWt.toFixed(2)}%</td>
                <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{(d.ffMcap / 1e9).toFixed(2)}B</td>
                <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{(d.ordMcap / 1e9).toFixed(2)}B</td>
                <td className="px-4 py-2.5 text-right font-mono text-foreground">{d.volume.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > visibleCount && (
          <div className="border-t border-border bg-surface px-4 py-3 text-center">
            <button
              onClick={() => setVisibleCount((n) => n + 100)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-surface-hover hover:border-primary/40"
            >
              Load 100 more ({filtered.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
