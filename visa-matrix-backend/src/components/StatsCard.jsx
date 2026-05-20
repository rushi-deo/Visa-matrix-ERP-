const toneStyles = {
  blue: {
    ring: "ring-blue-500/20",
    icon: "bg-blue-500/15 text-blue-300",
    accent: "text-blue-300",
  },
  emerald: {
    ring: "ring-emerald-500/20",
    icon: "bg-emerald-500/15 text-emerald-300",
    accent: "text-emerald-300",
  },
  amber: {
    ring: "ring-amber-500/20",
    icon: "bg-amber-500/15 text-amber-300",
    accent: "text-amber-300",
  },
  cyan: {
    ring: "ring-cyan-500/20",
    icon: "bg-cyan-500/15 text-cyan-300",
    accent: "text-cyan-300",
  },
};

export default function StatsCard({ title, value, meta, icon: Icon, tone = "blue" }) {
  const palette = toneStyles[tone] || toneStyles.blue;

  return (
    <section className={`card-panel ring-1 ${palette.ring}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          <p className={`mt-2 text-sm font-medium ${palette.accent}`}>{meta}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${palette.icon}`}>
          <Icon className="text-xl" />
        </div>
      </div>
    </section>
  );
}
