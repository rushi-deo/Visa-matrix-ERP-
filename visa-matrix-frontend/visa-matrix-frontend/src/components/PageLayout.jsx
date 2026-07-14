import React from "react";
import PageHeader from "./PageHeader";

export default function PageLayout({
  title,
  description,
  action,
  eyebrow,
  children,
  className = "",
}) {
  return (
    <div className={`space-y-6 ${className}`.trim()}>
      <PageHeader title={title} description={description} action={action} eyebrow={eyebrow} />
      <div className="space-y-6">{children}</div>
    </div>
  );
}
