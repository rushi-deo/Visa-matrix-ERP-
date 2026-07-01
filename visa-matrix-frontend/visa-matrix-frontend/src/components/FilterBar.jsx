import React from "react";

export default function FilterBar({ children, className = "" }) {
  return (
    <div className={`flex flex-wrap items-stretch gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`.trim()}>
      {children}
    </div>
  );
}
