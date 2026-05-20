import { toTitleCase } from "../../utils/formatters";

type StatusPillProps = {
  value?: string | null;
};

const toneMap: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  issued: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  processing: "bg-amber-100 text-amber-700",
  submitted: "bg-blue-100 text-blue-700",
  pending: "bg-slate-100 text-slate-600",
  review: "bg-violet-100 text-violet-700",
};

export default function StatusPill({ value }: StatusPillProps) {
  const normalized = String(value || "Pending").toLowerCase();
  const className =
    Object.entries(toneMap).find(([key]) => normalized.includes(key))?.[1] ||
    "bg-slate-100 text-slate-600";

  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        className,
      ].join(" ")}
    >
      {toTitleCase(value || "Pending")}
    </span>
  );
}
