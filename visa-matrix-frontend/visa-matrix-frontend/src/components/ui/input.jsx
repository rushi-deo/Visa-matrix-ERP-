import React from "react";

function Input({
  className = "",
  type = "text",
  ...props
}) {
  return (
    <input
      type={type}
      className={`vm-input disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}

export { Input };