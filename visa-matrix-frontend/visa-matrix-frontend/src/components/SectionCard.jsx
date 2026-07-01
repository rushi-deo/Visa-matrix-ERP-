import React from "react";

export default function SectionCard({ title, description, children, actions, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`.trim()}>
      {(title || description || actions) && (
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            {title ? <h3 className="text-lg font-semibold text-slate-900">{title}</h3> : null}
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
