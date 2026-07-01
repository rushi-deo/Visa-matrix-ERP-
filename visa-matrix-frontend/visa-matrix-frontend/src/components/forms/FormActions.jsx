import React from "react";

export default function FormActions({ children, align = "end", className = "" }) {
  return (
    <div className={`vm-form-actions vm-form-actions--${align} ${className}`.trim()}>
      {children}
    </div>
  );
}
