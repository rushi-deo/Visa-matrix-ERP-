import React from "react";
import FileUpload from "../FileUpload";

function FormField({
  label,
  description,
  helperText,
  error,
  required = false,
  className = "",
  labelClassName = "",
  controlClassName = "",
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  options = [],
  rows = 4,
  children,
  ...props
}) {
  const inputId = id ?? name;
  const sharedControlClassName = `vm-form-control ${controlClassName}`.trim();

  const renderControl = () => {
    if (children) {
      return children;
    }

    if (type === "textarea") {
      return <textarea className={sharedControlClassName} id={inputId} name={name} onChange={onChange} placeholder={placeholder} rows={rows} value={value ?? ""} {...props} />;
    }

    if (type === "select") {
      return (
        <select className={sharedControlClassName} id={inputId} name={name} onChange={onChange} value={value ?? ""} {...props}>
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value ?? option.label} value={option.value ?? option.label}>
              {option.label ?? option.value ?? option}
            </option>
          ))}
        </select>
      );
    }

    if (type === "checkbox") {
      return (
        <label className="vm-form-check">
          <input checked={Boolean(value)} className="vm-form-check__input" id={inputId} name={name} onChange={onChange} type="checkbox" {...props} />
          <span className="vm-form-check__label">{label}</span>
        </label>
      );
    }

    if (type === "radio") {
      return (
        <div className="vm-form-radio-group">
          {options.map((option) => (
            <label className="vm-form-check" key={option.value ?? option.label}>
              <input checked={value === (option.value ?? option.label)} className="vm-form-check__input" id={`${inputId}-${option.value ?? option.label}`} name={name} onChange={onChange} type="radio" value={option.value ?? option.label} {...props} />
              <span className="vm-form-check__label">{option.label ?? option.value ?? option}</span>
            </label>
          ))}
        </div>
      );
    }

    if (type === "switch") {
      return (
        <label className="vm-form-switch">
          <input checked={Boolean(value)} className="vm-form-switch__input" id={inputId} name={name} onChange={onChange} type="checkbox" {...props} />
          <span className="vm-form-switch__track" aria-hidden="true" />
        </label>
      );
    }

    if (type === "date") {
      return <input className={sharedControlClassName} id={inputId} name={name} onChange={onChange} type="date" value={value ?? ""} {...props} />;
    }

    if (type === "file") {
      return <FileUpload onFilesChange={onChange} />;
    }

    return <input className={sharedControlClassName} id={inputId} name={name} onChange={onChange} placeholder={placeholder} type={type} value={value ?? ""} {...props} />;
  };

  return (
    <div className={`vm-form-field ${className}`.trim()}>
      {label ? (
        <label className={`vm-form-field__label ${labelClassName}`.trim()} htmlFor={inputId}>
          {label}
          {required ? <span className="vm-form-field__required">*</span> : null}
        </label>
      ) : null}
      {description ? <p className="vm-form-field__description">{description}</p> : null}
      <div className="vm-form-field__control">{renderControl()}</div>
      {helperText ? <p className="vm-form-field__helper">{helperText}</p> : null}
      {error ? <p className="vm-form-field__error">{error}</p> : null}
    </div>
  );
}

export default FormField;
