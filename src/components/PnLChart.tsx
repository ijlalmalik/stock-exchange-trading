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
    <div className="animate-fade-in rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profit & Loss</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis dataKey="script" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          <Bar dataKey="change" radius={[4, 4, 0, 0]} maxBarSize={40}>
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
  );
}
