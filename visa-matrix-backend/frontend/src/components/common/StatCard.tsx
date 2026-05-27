import type { LucideIcon } from "lucide-react";

import { formatNumber } from "../../utils/formatters";

type StatCardProps = {
  label: string;
  value: number;
  delta: string;
  icon: LucideIcon;
};

export default function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: StatCardProps) {
  const isDeltaPositive = delta.startsWith("+");

  return (
    <article className={[
      "group rounded-premium border bg-gradient-to-br from-white to-premium-platinum-50",
      "border-premium-silver-200/60 p-6 shadow-card",
      "transition-all duration-300 hover:shadow-card-hover hover:border-premium-blue-300/40",
      "relative overflow-hidden",
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-premium-blue-500/0 before:to-premium-blue-500/0",
      "hover:before:from-premium-blue-500/5 hover:before:to-premium-blue-500/5 before:transition-all before:duration-300",
    ].join(" ")}>
      {/* Background Accent */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-premium-blue-500/10 to-premium-blue-600/5 blur-2xl transition-all duration-300 group-hover:scale-110" />
      
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-premium-silver-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-premium-navy-950">
            {formatNumber(value)}
          </p>
        </div>
        <span className={[
          "flex h-14 w-14 items-center justify-center rounded-premium",
          "bg-gradient-to-br from-premium-blue-500/20 to-premium-blue-600/10",
          "text-premium-blue-600 font-semibold",
          "border border-premium-blue-300/30",
          "transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-sm",
        ].join(" ")}>
          <Icon size={24} />
        </span>
      </div>

      {/* Delta Indicator */}
      <p className={[
        "mt-4 text-sm font-medium transition-all duration-300",
        isDeltaPositive
          ? "text-premium-emerald"
          : "text-premium-rose",
      ].join(" ")}>
        {delta}
      </p>
    </article>
  );
}
