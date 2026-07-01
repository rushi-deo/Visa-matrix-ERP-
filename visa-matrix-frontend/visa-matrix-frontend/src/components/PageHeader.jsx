import React from "react";
import Breadcrumbs from "./Breadcrumbs";

export default function PageHeader({ title, description, action, eyebrow = "Workspace" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumbs currentLabel={title} />
          <span className="mt-2 inline-flex text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">{eyebrow}</span>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p>
        </div>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </div>
    </div>
  );
}
