import React from "react";
import Breadcrumbs from "./Breadcrumbs";

export default function PageHeader({ title, description, action, eyebrow = "Workspace" }) {
  return (
    <div className="vm-surface-card vm-page-header">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumbs currentLabel={title} />
          <span className="vm-eyebrow mt-2">{eyebrow}</span>
          <h2 className="vm-heading mt-2 text-2xl tracking-tight">{title}</h2>
          <p className="vm-muted mt-1 max-w-3xl text-sm">{description}</p>
        </div>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </div>
    </div>
  );
}
