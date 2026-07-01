import React from "react";

export default function FormRow({ children, columns = 2, className = "" }) {
  const safeColumns = Math.max(1, Math.min(4, Number(columns) || 2));

  return (
    <div
      className={`vm-form-row ${className}`.trim()}
      style={{ "--vm-form-row-columns": String(safeColumns) }}
    >
      {children}
    </div>
  );
}
