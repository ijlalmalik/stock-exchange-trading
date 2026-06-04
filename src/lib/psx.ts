import { createServerFn } from "@tanstack/react-start";

export interface KSE100Snapshot {
  current: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  previousClose: number;
  timestamp: string;
  sourceUrl: string;
}

const FALLBACK_SNAPSHOT: KSE100Snapshot = {
  current: 171181.56,
  change: 990.92,
  changePct: 0.58,
  high: 171271.72,
  low: 170563.4,
  previousClose: 170190.64,
  timestamp: "Latest stored PSX snapshot",
  sourceUrl: "https://dps.psx.com.pk/",
};

function parseNumber(value: string) {
  return Number.parseFloat(value.replace(/,/g, "").trim());
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        accept: "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        pragma: "no-cache",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        referer: "https://dps.psx.com.pk/",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson<T>(url: string, ms: number): Promise<T> {
  const res = await fetchWithTimeout(url, ms);
  if (!res.ok) throw new Error(`PSX responded ${res.status}`);
  return (await res.json()) as T;
}

function formatPsxTime(epochSeconds: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Karachi",
  }).format(new Date(epochSeconds * 1000));
}

function parseFromIndicesHtml(html: string): KSE100Snapshot | null {
  const timestampMatch = html.match(
    /<div style="text-align:\s*right;\s*padding-bottom:\s*0\.4em;">As of\s*(.*?)<\/div>/i,
  );
  const rowMatch = html.match(
    /<tr><td><a class="link" href="javascript:;" data-code="KSE100"><b>KSE100<\/b><\/a><\/td><td class="right" data-order="([^"]+)">[\s\S]*?<\/td><td class="right" data-order="([^"]+)">[\s\S]*?<\/td><td class="right" data-order="([^"]+)">[\s\S]*?<\/td><td class="right[^"]*" data-order="([^"]+)">[\s\S]*?<\/td><td class="right[^"]*" data-order="([^"]+)">/i,
  );
  if (!rowMatch) return null;
  const high = parseNumber(rowMatch[1]);
  const low = parseNumber(rowMatch[2]);
  const current = parseNumber(rowMatch[3]);
  const change = parseNumber(rowMatch[4]);
  const changePct = parseNumber(rowMatch[5]);
  if ([high, low, current, change, changePct].some((v) => Number.isNaN(v))) return null;
  return {
    current,
    change,
    changePct,
    high,
    low,
    previousClose: current - change,
    timestamp: timestampMatch?.[1].replace(/\s+/g, " ").trim() ?? "PSX Live",
    sourceUrl: "https://dps.psx.com.pk/",
  };
}

async function parseFromTimeseriesJson(): Promise<KSE100Snapshot | null> {
  type PsxPoint = [number, number, number?, number?];
  type PsxTimeseries = { status?: number; data?: PsxPoint[] };

  const intraday = await fetchJson<PsxTimeseries>("https://dps.psx.com.pk/timeseries/int/KSE100", 6000);
  const points = (intraday.data ?? [])
    .filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]))
    .sort((a, b) => b[0] - a[0]);

  if (!points.length) return null;

  const latest = points[0];
  const values = points.map((point) => point[1]);
  const current = latest[1];
  const high = Math.max(...values);
  const low = Math.min(...values);

  let previousClose = current;
  try {
    const eod = await fetchJson<PsxTimeseries>("https://dps.psx.com.pk/timeseries/eod/KSE100", 6000);
    const eodPoints = (eod.data ?? [])
      .filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]))
      .sort((a, b) => b[0] - a[0]);
    previousClose = eodPoints[0]?.[1] ?? current;
  } catch {
    previousClose = current;
  }

  const change = current - previousClose;
  const changePct = previousClose ? (change / previousClose) * 100 : 0;

  return {
    current,
    change,
    changePct,
    high,
    low,
    previousClose,
    timestamp: formatPsxTime(latest[0]),
    sourceUrl: "https://dps.psx.com.pk/",
  };
}

// In-memory cache (per worker isolate) — avoids hammering PSX and gives mobile
// clients a near-instant response on repeat polls.
let cached: { data: KSE100Snapshot; at: number } | null = null;
const CACHE_TTL_MS = 30_000;

async function tryFetchSnapshot(): Promise<KSE100Snapshot> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const timeseries = await parseFromTimeseriesJson();
      if (timeseries) return timeseries;

      const res = await fetchWithTimeout("https://dps.psx.com.pk/indices", 8000);
      if (!res.ok) {
        lastError = new Error(`PSX responded ${res.status}`);
        continue;
      }
      const html = await res.text();
      const parsed = parseFromIndicesHtml(html);
      if (parsed) return parsed;
      lastError = new Error("KSE100 row not found");
    } catch (err) {
      lastError = err;
    }
    // small backoff
    await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
  }
  throw lastError instanceof Error ? lastError : new Error("Failed to fetch PSX indices");
}

export async function fetchKSE100Snapshot() {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }
  try {
    const fresh = await tryFetchSnapshot();
    cached = { data: fresh, at: now };
    return fresh;
  } catch {
    // The dashboard should never show an empty KSE card; keep the newest known value or a bundled snapshot.
    cached = { data: cached?.data ?? FALLBACK_SNAPSHOT, at: now };
    return cached.data;
  }
}

export const getKSE100Snapshot = createServerFn({ method: "GET" }).handler(async () => {
  return fetchKSE100Snapshot();
});
