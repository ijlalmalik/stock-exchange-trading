const API_KEY = "AIzaSyCNJmAwzoBg_HJMhQ6ujyVP2aBSkuIVW4Y";
const SHEET_ID = "15UyH-mxMLU1BwjJpHIEav2gwDgwT4YwCAHK2vfCYgW4";

export interface StockHolding {
  no: number;
  script: string;
  company: string;
  shares: number;
  ldcp: number;
  purchasedRate: number;
  direction: string;
  currentValue: number;
  bookValue: number;
  change: number;
  changePercent: number;
  week52Low: number;
  week52High: number;
  upFromLow: number;
  downFromHigh: number;
  dividend: number;
}

function parseNum(val: string): number {
  if (!val) return 0;
  const cleaned = val.toString().replace(/[,%]/g, "").trim();
  return parseFloat(cleaned) || 0;
}

export async function fetchPortfolioData(): Promise<StockHolding[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A2:P10?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch sheet data");
  const json = await res.json();
  const rows: string[][] = json.values || [];

  return rows
    .filter((r) => r[0] && r[1])
    .map((r) => ({
      no: parseInt(r[0]) || 0,
      script: r[1] || "",
      company: r[2] || "",
      shares: parseNum(r[3]),
      ldcp: parseNum(r[4]),
      purchasedRate: parseNum(r[5]),
      direction: r[6] || "",
      currentValue: parseNum(r[7]),
      bookValue: parseNum(r[8]),
      change: parseNum(r[9]),
      changePercent: parseNum(r[10]),
      week52Low: parseNum(r[11]),
      week52High: parseNum(r[12]),
      upFromLow: parseNum(r[13]),
      downFromHigh: parseNum(r[14]),
      dividend: parseNum(r[15]),
    }));
}

export function getPortfolioSummary(holdings: StockHolding[]) {
  const totalCurrentValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalBookValue = holdings.reduce((s, h) => s + h.bookValue, 0);
  const totalShares = holdings.reduce((s, h) => s + h.shares, 0);
  const totalPnL = totalCurrentValue - totalBookValue;
  const returnPct = totalBookValue > 0 ? (totalPnL / totalBookValue) * 100 : 0;

  return { totalCurrentValue, totalBookValue, totalShares, totalPnL, returnPct, stockCount: holdings.length };
}
