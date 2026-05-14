import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import type { StockHolding } from "@/lib/google-sheets";

interface PnLChartProps {
  holdings: StockHolding[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const isPositive = d.change >= 0;
  return (
    <div className="rounded-lg border border-border/40 bg-card/90 backdrop-blur-sm px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-card-foreground">{d.script}</p>
      <p className={`text-sm font-mono font-bold ${isPositive ? "text-[var(--color-gain)]" : "text-[var(--color-loss)]"}`}>
        {isPositive ? "+" : ""}PKR {d.change.toLocaleString()}
      </p>
      <p className={`text-xs font-mono ${isPositive ? "text-[var(--color-gain)]" : "text-[var(--color-loss)]"}`}>
        {isPositive ? "+" : ""}{d.changePercent.toFixed(2)}%
      </p>
    </div>
  );
}

export function PnLChart({ holdings }: PnLChartProps) {
  const data = holdings.map((h) => ({
    script: h.script,
    change: h.change,
    changePercent: h.changePercent,
  }));

  return (
    <div className="min-w-0 animate-fade-in rounded-xl border border-border bg-card p-3.5 sm:p-5">
      <h3 className="mb-3 sm:mb-4 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profit & Loss</h3>
      <div className="h-[240px] min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 4, bottom: 5, left: -12 }}>
          <XAxis dataKey="script" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          <Bar dataKey="change" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.change >= 0 ? "var(--color-gain)" : "var(--color-loss)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
