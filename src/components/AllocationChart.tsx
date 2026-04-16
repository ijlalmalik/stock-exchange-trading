import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { StockHolding } from "@/lib/google-sheets";

const COLORS = [
  "oklch(0.65 0.2 250)", "oklch(0.6 0.18 170)", "oklch(0.7 0.2 45)",
  "oklch(0.6 0.22 310)", "oklch(0.65 0.2 25)", "oklch(0.55 0.15 200)",
  "oklch(0.7 0.18 130)", "oklch(0.6 0.2 80)", "oklch(0.55 0.22 340)",
];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-card-foreground">{d.company}</p>
      <p className="text-xs text-muted-foreground">{d.script}</p>
      <p className="text-sm font-mono text-card-foreground">PKR {d.currentValue.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{d.pct.toFixed(1)}% of portfolio</p>
    </div>
  );
}

export function AllocationChart({ holdings }: { holdings: StockHolding[] }) {
  const total = holdings.reduce((s, h) => s + h.currentValue, 0);
  const data = holdings.map((h) => ({
    ...h,
    pct: total > 0 ? (h.currentValue / total) * 100 : 0,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Portfolio Allocation</h3>
      <p className="mb-4 text-xs text-muted-foreground">Total: PKR {total.toLocaleString()}</p>
      <div className="flex flex-col items-center gap-4 lg:flex-row">
        <div className="w-full max-w-[240px]">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data} dataKey="currentValue" nameKey="script" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2} strokeWidth={0}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 gap-2">
            {data.map((h, i) => (
              <div key={h.script} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-sm font-medium text-foreground">{h.script}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground">PKR {h.currentValue.toLocaleString()}</span>
                  <span className="min-w-[42px] text-right text-xs font-semibold text-foreground">{h.pct.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
