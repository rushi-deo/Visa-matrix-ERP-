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
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_rgba(11,46,89,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {formatNumber(value)}
          </p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[#1E5BB8]">
          <Icon size={22} />
        </span>
      </div>
      <p className="mt-4 text-sm text-emerald-600">{delta}</p>
    </article>
  );
}
