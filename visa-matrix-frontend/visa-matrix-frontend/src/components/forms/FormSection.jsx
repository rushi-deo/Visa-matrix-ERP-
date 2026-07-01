import React from "react";

export default function FormSection({ title, description, children, actions, className = "" }) {
  return (
    <section className={`vm-form-section ${className}`.trim()}>
      {(title || description || actions) ? (
        <div className="vm-form-section__header">
          <div>
            {title ? <h3 className="vm-form-section__title">{title}</h3> : null}
            {description ? <p className="vm-form-section__description">{description}</p> : null}
          </div>
          {actions ? <div className="vm-form-section__actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className="vm-form-section__body">{children}</div>
    </section>
  );
}
