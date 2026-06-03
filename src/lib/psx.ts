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

function parseNumber(value: string) {
  return Number.parseFloat(value.replace(/,/g, "").trim());
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        referer: "https://dps.psx.com.pk/",
      },
    });
  } finally {
    clearTimeout(timer);
  }
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

// In-memory cache (per worker isolate) — avoids hammering PSX and gives mobile
// clients a near-instant response on repeat polls.
let cached: { data: KSE100Snapshot; at: number } | null = null;
const CACHE_TTL_MS = 30_000;

async function tryFetchSnapshot(): Promise<KSE100Snapshot> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
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

export const getKSE100Snapshot = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }
  try {
    const fresh = await tryFetchSnapshot();
    cached = { data: fresh, at: now };
    return fresh;
  } catch (err) {
    // Serve last known good value if available — better than failing the UI
    if (cached) return cached.data;
    throw err instanceof Error ? err : new Error("Failed to fetch PSX indices");
  }
});
