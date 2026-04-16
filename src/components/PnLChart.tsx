import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts";
import type { StockHolding } from "@/lib/google-sheets";

interface PnLChartProps {
  holdings: StockHolding[];
}

function CustomLabel(props: any) {
  const { x, y, width, height, value, index, activeIndex } = props;
  if (index !== activeIndex || !width || !height) return null;
  
  const isPositive = value >= 0;
  const labelY = isPositive ? y + height / 2 : y + height / 2;
  
  return (
    <text
      x={x + width / 2}
      y={labelY}
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={11}
      fontWeight={600}
      fontFamily="JetBrains Mono, monospace"
      className="animate-fade-in"
      style={{ opacity: 1, transition: "opacity 0.3s ease-in-out" }}
    >
      {value >= 0 ? "+" : ""}{value.toFixed(2)}%
    </text>
  );
}

export function PnLChart({ holdings }: PnLChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = holdings.map((h) => ({
    script: h.script,
    change: h.change,
    changePercent: h.changePercent,
  }));

  return (
    <div className="animate-fade-in rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profit & Loss</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          onMouseMove={(state: any) => {
            if (state?.activeTooltipIndex !== undefined) {
              setActiveIndex(state.activeTooltipIndex);
            }
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <XAxis dataKey="script" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
          <Bar dataKey="change" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.change >= 0 ? "var(--color-gain)" : "var(--color-loss)"}
                fillOpacity={activeIndex === null || activeIndex === i ? 1 : 0.4}
                style={{ transition: "fill-opacity 0.3s ease" }}
              />
            ))}
            <LabelList
              dataKey="changePercent"
              content={(props: any) => <CustomLabel {...props} activeIndex={activeIndex} />}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
