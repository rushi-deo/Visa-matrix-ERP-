import React from "react";

export default function FilterBar({ children, className = "" }) {
  return <div className={`vm-surface-card vm-filter-bar ${className}`.trim()}>{children}</div>;
}
