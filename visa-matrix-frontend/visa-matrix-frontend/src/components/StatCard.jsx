import React from "react";
export default function StatCard({ title, value, icon, color }) {
  return (
    <article className="vm-surface-card vm-stat-card" style={{ "--card-accent": color }}>
      <div className="grid h-12 w-12 place-items-center rounded-2xl text-sm font-semibold" style={{ color, background: `${color}14` }}>
        {icon}
      </div>
      <div>
        <span className="vm-muted block text-sm">{title}</span>
        <strong className="vm-heading mt-1 block text-xl">{value}</strong>
      </div>
    </article>
  );
}
