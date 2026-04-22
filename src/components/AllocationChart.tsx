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
    <div className="rounded-md border border-border/50 bg-card/95 backdrop-blur-sm px-2.5 py-1.5 shadow-lg text-[11px]">
      <p className="font-semibold text-card-foreground leading-tight">{d.script}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">{d.company}</p>
      <p className="font-mono text-card-foreground mt-0.5">PKR {d.currentValue.toLocaleString()}</p>
      <p className="text-muted-foreground">{d.pct.toFixed(1)}%</p>
    </div>
  );
}

export function AllocationChart({ holdings }: { holdings: StockHolding[] }) {
  const total = holdings.reduce((s, h) => s + h.currentValue, 0);
  const data = [...holdings]
    .sort((a, b) => b.currentValue - a.currentValue)
    .map((h) => ({
      ...h,
      pct: total > 0 ? (h.currentValue / total) * 100 : 0,
    }));

  return (
    <div className="animate-fade-in rounded-xl border border-border bg-card p-3.5 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Portfolio Allocation</h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground">Total: PKR {total.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-5 lg:flex-row lg:gap-6">
        {/* Donut Chart */}
        <div className="relative w-full max-w-[200px] sm:max-w-[220px]">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} dataKey="currentValue" nameKey="script" cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={2} strokeWidth={0}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-[11px] text-muted-foreground">Stocks</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{holdings.length}</p>
            </div>
          </div>
        </div>

        {/* Legend & bars */}
        <div className="flex-1 w-full space-y-2">
          {data.map((h, i) => (
            <div key={h.script} className="animate-fade-in group" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <div className="leading-tight">
                    <span className="text-sm font-semibold text-foreground">{h.script}</span>
                    <p className="text-[10px] text-muted-foreground">{h.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground">PKR {h.currentValue.toLocaleString()}</span>
                  <span className="min-w-[42px] text-right text-xs font-bold text-foreground">{h.pct.toFixed(1)}%</span>
                </div>
              </div>
              {/* Allocation bar */}
              <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${h.pct}%`,
                    background: COLORS[i % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
