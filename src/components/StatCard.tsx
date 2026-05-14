import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  variant?: "default" | "gain" | "loss";
}

export function StatCard({ title, value, subtitle, icon, variant = "default" }: StatCardProps) {
  const variantClasses = {
    default: "border-border",
    gain: "border-gain/30",
    loss: "border-loss/30",
  };
  const valueClasses = {
    default: "text-foreground",
    gain: "text-gain",
    loss: "text-loss",
  };

  return (
    <div className={`min-w-0 animate-fade-in rounded-xl border bg-card p-3.5 sm:p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/20 ${variantClasses[variant]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className={`mt-2 break-words text-base font-bold tracking-tight sm:text-2xl ${valueClasses[variant]}`}>{value}</p>
      <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}
