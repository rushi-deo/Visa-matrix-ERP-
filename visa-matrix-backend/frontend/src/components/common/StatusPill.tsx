import { toTitleCase } from "../../utils/formatters";

type StatusPillProps = {
  value?: string | null;
};

const toneMap: Record<string, string> = {
  approved: "bg-premium-emerald/15 text-premium-emerald border border-premium-emerald/30",
  issued: "bg-premium-emerald/15 text-premium-emerald border border-premium-emerald/30",
  rejected: "bg-premium-rose/15 text-premium-rose border border-premium-rose/30",
  processing: "bg-premium-orange/15 text-premium-orange border border-premium-orange/30",
  submitted: "bg-premium-blue-100/60 text-premium-blue-800 border border-premium-blue-200/50",
  pending: "bg-premium-silver-100 text-premium-silver-500 border border-premium-silver-200",
  review: "bg-premium-blue-100/60 text-premium-blue-900 border border-premium-blue-200/50",
};

export default function StatusPill({ value }: StatusPillProps) {
  const normalized = String(value || "Pending").toLowerCase();
  const className =
    Object.entries(toneMap).find(([key]) => normalized.includes(key))?.[1] ||
    "bg-premium-silver-100 text-premium-silver-500 border border-premium-silver-200";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1.5",
        "text-xs font-semibold tracking-wide transition-all duration-300",
        "hover:shadow-sm hover:scale-105",
        className,
      ].join(" ")}
    >
      {toTitleCase(value || "Pending")}
    </span>
  );
}
