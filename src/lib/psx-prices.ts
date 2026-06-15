import { createServerFn } from "@tanstack/react-start";

export interface PSXPricesResult {
  prices: Record<string, number>;
  timestamp: string;
  sourceUrl: string;
}

const SOURCE_URL = "https://dps.psx.com.pk/market-watch";
const CACHE_TTL_MS = 30_000;
let cached: { data: PSXPricesResult; at: number } | null = null;

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      cache: "no-store",
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

// Each row in PSX market-watch has 5 numeric "right" cells before CHANGE:
// [LDCP, OPEN, HIGH, LOW, CURRENT]. We extract just CURRENT.
function parseMarketWatch(html: string): Record<string, number> {
  const prices: Record<string, number> = {};
  const rowRe = /<tr><td data-search="([^"]+)"[\s\S]*?<\/tr>/g;
  const cellRe = /<td class="right" data-order="([0-9.]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(html)) !== null) {
    const symbol = m[1];
    const row = m[0];
    const cells: number[] = [];
    let c: RegExpExecArray | null;
    cellRe.lastIndex = 0;
    while ((c = cellRe.exec(row)) !== null) {
      cells.push(parseFloat(c[1]));
      if (cells.length >= 5) break;
    }
    if (cells.length >= 5 && Number.isFinite(cells[4])) {
      prices[symbol.toUpperCase()] = cells[4];
    }
  }
  return prices;
}

function formatPsxNow(): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Karachi",
  }).format(new Date());
}

export async function fetchPSXPrices(): Promise<PSXPricesResult> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_TTL_MS) return cached.data;
  try {
    const res = await fetchWithTimeout(SOURCE_URL, 8000);
    if (!res.ok) throw new Error(`PSX ${res.status}`);
    const html = await res.text();
    const prices = parseMarketWatch(html);
    if (Object.keys(prices).length === 0) throw new Error("No rows parsed");
    const data: PSXPricesResult = { prices, timestamp: formatPsxNow(), sourceUrl: SOURCE_URL };
    cached = { data, at: now };
    return data;
  } catch (err) {
    if (cached) return cached.data;
    throw err;
  }
}

export const getPSXPrices = createServerFn({ method: "GET" }).handler(async () => {
  return fetchPSXPrices();
});
