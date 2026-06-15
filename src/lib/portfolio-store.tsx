import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { fetchPortfolioData, type StockHolding } from "@/lib/google-sheets";
import { getPSXPrices, type PSXPricesResult } from "@/lib/psx-prices";

const OVERRIDES_KEY = "portfolio_overrides_v1";
const DELETED_KEY = "portfolio_deleted_v1";
const ADDED_KEY = "portfolio_added_v1";

type Overrides = Record<string, Partial<StockHolding>>;

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, val: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

function recompute(h: StockHolding): StockHolding {
  const currentValue = h.shares * h.ldcp;
  const bookValue = h.shares * h.purchasedRate;
  const change = currentValue - bookValue;
  const changePercent = bookValue > 0 ? (change / bookValue) * 100 : 0;
  const upFromLow = h.week52Low > 0 ? ((h.ldcp - h.week52Low) / h.week52Low) * 100 : 0;
  const downFromHigh = h.week52High > 0 ? ((h.week52High - h.ldcp) / h.week52High) * 100 : 0;
  return { ...h, currentValue, bookValue, change, changePercent, upFromLow, downFromHigh };
}

interface PortfolioCtx {
  holdings: StockHolding[];
  loading: boolean;
  refreshing: boolean;
  lastUpdated: Date | null;
  psxTimestamp: string | null;
  refresh: () => Promise<void>;
  addHolding: (h: Omit<StockHolding, "no" | "currentValue" | "bookValue" | "change" | "changePercent" | "upFromLow" | "downFromHigh" | "direction">) => void;
  updateHolding: (script: string, patch: Partial<StockHolding>) => void;
  deleteHolding: (script: string) => void;
  resetOverrides: () => void;
}

const Ctx = createContext<PortfolioCtx | null>(null);

async function loadPSXPrices(): Promise<PSXPricesResult | null> {
  try {
    return await getPSXPrices();
  } catch {
    // Fallback to public API route (helps on mobile / when RPC fails)
    try {
      const res = await fetch(`/api/public/psx-prices?t=${Date.now()}`, {
        cache: "no-store",
        headers: { accept: "application/json" },
      });
      if (!res.ok) return null;
      return (await res.json()) as PSXPricesResult;
    } catch {
      return null;
    }
  }
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [remote, setRemote] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [overrides, setOverrides] = useState<Overrides>(() => loadJSON(OVERRIDES_KEY, {}));
  const [deleted, setDeleted] = useState<string[]>(() => loadJSON(DELETED_KEY, []));
  const [added, setAdded] = useState<StockHolding[]>(() => loadJSON(ADDED_KEY, []));
  const [psxPrices, setPsxPrices] = useState<Record<string, number>>({});
  const [psxTimestamp, setPsxTimestamp] = useState<string | null>(null);
  const tickRef = useRef(0);

  const refreshPSX = useCallback(async () => {
    const res = await loadPSXPrices();
    if (res && Object.keys(res.prices).length > 0) {
      // Keep last known prices for symbols missing from this snapshot
      setPsxPrices((prev) => ({ ...prev, ...res.prices }));
      setPsxTimestamp(res.timestamp);
    }
  }, []);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [data] = await Promise.all([fetchPortfolioData(), refreshPSX()]);
      setRemote(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshPSX]);

  useEffect(() => {
    void load(false);
  }, [load]);

  // Auto-refresh PSX prices every 60 seconds
  useEffect(() => {
    const id = setInterval(() => {
      void refreshPSX();
    }, 60_000);
    return () => clearInterval(id);
  }, [refreshPSX]);

  const refresh = useCallback(async () => {
    tickRef.current += 1;
    window.dispatchEvent(new CustomEvent("portfolio:refresh", { detail: tickRef.current }));
    await load(true);
  }, [load]);

  const holdings = useMemo(() => {
    const applyPSX = (h: StockHolding): StockHolding => {
      const live = psxPrices[h.script?.toUpperCase?.() ?? ""];
      return Number.isFinite(live) && live! > 0 ? recompute({ ...h, ldcp: live! }) : h;
    };
    const base = remote
      .filter((h) => !deleted.includes(h.script))
      .map((h) => {
        const ov = overrides[h.script];
        const merged = ov ? recompute({ ...h, ...ov }) : h;
        return applyPSX(merged);
      });
    const extra = added.map((h, i) => applyPSX(recompute({ ...h, no: base.length + i + 1 })));
    return [...base, ...extra];
  }, [remote, overrides, deleted, added, psxPrices]);

  const addHolding: PortfolioCtx["addHolding"] = useCallback((h) => {
    const next = [...added, { ...h, no: 0, direction: "", currentValue: 0, bookValue: 0, change: 0, changePercent: 0, upFromLow: 0, downFromHigh: 0 } as StockHolding];
    setAdded(next);
    saveJSON(ADDED_KEY, next);
  }, [added]);

  const updateHolding = useCallback((script: string, patch: Partial<StockHolding>) => {
    const inAdded = added.find((a) => a.script === script);
    if (inAdded) {
      const next = added.map((a) => (a.script === script ? recompute({ ...a, ...patch }) : a));
      setAdded(next);
      saveJSON(ADDED_KEY, next);
    } else {
      const next = { ...overrides, [script]: { ...(overrides[script] || {}), ...patch } };
      setOverrides(next);
      saveJSON(OVERRIDES_KEY, next);
    }
  }, [added, overrides]);

  const deleteHolding = useCallback((script: string) => {
    if (added.find((a) => a.script === script)) {
      const next = added.filter((a) => a.script !== script);
      setAdded(next);
      saveJSON(ADDED_KEY, next);
    } else {
      const next = [...deleted, script];
      setDeleted(next);
      saveJSON(DELETED_KEY, next);
    }
  }, [added, deleted]);

  const resetOverrides = useCallback(() => {
    setOverrides({});
    setDeleted([]);
    setAdded([]);
    saveJSON(OVERRIDES_KEY, {});
    saveJSON(DELETED_KEY, []);
    saveJSON(ADDED_KEY, []);
  }, []);

  return (
    <Ctx.Provider value={{ holdings, loading, refreshing, lastUpdated, psxTimestamp, refresh, addHolding, updateHolding, deleteHolding, resetOverrides }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
}
