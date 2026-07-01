import React from "react";
export default function StatCard({ title, value, icon, color }) {
  return (
    <article
      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
      style={{ "--card-accent": color }}
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl text-sm font-semibold" style={{ color, background: `${color}14` }}>
        {icon}
      </div>
      <div>
        <span className="block text-sm text-slate-500">{title}</span>
        <strong className="mt-1 block text-xl font-semibold text-slate-900">{value}</strong>
      </div>
    </article>
  );
}
