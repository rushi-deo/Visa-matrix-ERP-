import React from "react";

export default function SectionCard({ title, description, children, actions, className = "" }) {
  return (
    <section className={`vm-surface-card vm-section-card ${className}`.trim()}>
      {(title || description || actions) && (
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            {title ? <h3 className="vm-heading text-lg">{title}</h3> : null}
            {description ? <p className="vm-muted mt-1 text-sm">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
