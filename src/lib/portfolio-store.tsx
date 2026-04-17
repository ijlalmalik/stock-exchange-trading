import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { fetchPortfolioData, type StockHolding } from "@/lib/google-sheets";

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
  refresh: () => Promise<void>;
  addHolding: (h: Omit<StockHolding, "no" | "currentValue" | "bookValue" | "change" | "changePercent" | "upFromLow" | "downFromHigh" | "direction">) => void;
  updateHolding: (script: string, patch: Partial<StockHolding>) => void;
  deleteHolding: (script: string) => void;
  resetOverrides: () => void;
}

const Ctx = createContext<PortfolioCtx | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [remote, setRemote] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [overrides, setOverrides] = useState<Overrides>(() => loadJSON(OVERRIDES_KEY, {}));
  const [deleted, setDeleted] = useState<string[]>(() => loadJSON(DELETED_KEY, []));
  const [added, setAdded] = useState<StockHolding[]>(() => loadJSON(ADDED_KEY, []));
  const tickRef = useRef(0);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchPortfolioData();
      setRemote(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  const refresh = useCallback(async () => {
    tickRef.current += 1;
    window.dispatchEvent(new CustomEvent("portfolio:refresh", { detail: tickRef.current }));
    await load(true);
  }, [load]);

  const holdings = useMemo(() => {
    const base = remote
      .filter((h) => !deleted.includes(h.script))
      .map((h) => {
        const ov = overrides[h.script];
        return ov ? recompute({ ...h, ...ov }) : h;
      });
    const extra = added.map((h, i) => recompute({ ...h, no: base.length + i + 1 }));
    return [...base, ...extra];
  }, [remote, overrides, deleted, added]);

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
    <Ctx.Provider value={{ holdings, loading, refreshing, lastUpdated, refresh, addHolding, updateHolding, deleteHolding, resetOverrides }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
}
