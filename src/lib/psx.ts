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

export const getKSE100Snapshot = createServerFn({ method: "GET" }).handler(async () => {
  const response = await fetch("https://dps.psx.com.pk/indices", {
    headers: {
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch PSX indices");
  }

  const html = await response.text();
  const timestampMatch = html.match(
    /<div style="text-align:\s*right;\s*padding-bottom:\s*0\.4em;">As of\s*(.*?)<\/div>/i,
  );
  const rowMatch = html.match(
    /<tr><td><a class="link" href="javascript:;" data-code="KSE100"><b>KSE100<\/b><\/a><\/td><td class="right" data-order="([^"]+)">[\s\S]*?<\/td><td class="right" data-order="([^"]+)">[\s\S]*?<\/td><td class="right" data-order="([^"]+)">[\s\S]*?<\/td><td class="right[^"]*" data-order="([^"]+)">[\s\S]*?<\/td><td class="right[^"]*" data-order="([^"]+)">/i,
  );

  if (!rowMatch) {
    throw new Error("KSE100 row not found");
  }

  const high = parseNumber(rowMatch[1]);
  const low = parseNumber(rowMatch[2]);
  const current = parseNumber(rowMatch[3]);
  const change = parseNumber(rowMatch[4]);
  const changePct = parseNumber(rowMatch[5]);

  if ([high, low, current, change, changePct].some((value) => Number.isNaN(value))) {
    throw new Error("Invalid KSE100 values received");
  }

  return {
    current,
    change,
    changePct,
    high,
    low,
    previousClose: current - change,
    timestamp: timestampMatch?.[1].replace(/\s+/g, " ").trim() ?? "PSX Live",
    sourceUrl: "https://dps.psx.com.pk/",
  } satisfies KSE100Snapshot;
});