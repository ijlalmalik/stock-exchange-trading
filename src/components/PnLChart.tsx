import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts";
import type { StockHolding } from "@/lib/google-sheets";

interface PnLChartProps {
  holdings: StockHolding[];
}

function CustomLabel(props: any) {
  const { x, y, width, height, value, index, activeIndex, payload } = props;
  if (x == null || y == null || !width || !height) return null;

  const isPositive = (payload?.change ?? 0) >= 0;
  const isActive = index === activeIndex;
  const labelY = height < 32 ? y + height / 2 : isPositive ? y + 16 : y + height - 16;

  return (
    <text
      x={x + width / 2}
      y={labelY}
      fill="var(--color-chart-label)"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={10}
      fontWeight={700}
      fontFamily="JetBrains Mono, monospace"
      letterSpacing="0.02em"
      style={{
        opacity: isActive ? 1 : 0,
        transform: `translateY(${isActive ? 0 : isPositive ? 6 : -6}px)`,
        transformOrigin: `${x + width / 2}px ${labelY}px`,
        transition: "opacity 220ms ease, transform 220ms ease",
        pointerEvents: "none",
      }}
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
          <Bar
            dataKey="change"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            onMouseOver={(_: unknown, index: number) => setActiveIndex(index)}
            onMouseOut={() => setActiveIndex(null)}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.change >= 0 ? "var(--color-gain)" : "var(--color-loss)"}
                fillOpacity={activeIndex === null || activeIndex === i ? 1 : 0.4}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
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
