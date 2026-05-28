import React from "react";

function Input({
  className = "",
  type = "text",
  ...props
}) {
  return (
    <input
      type={type}
      className={`
        flex h-9 w-full rounded-md border border-slate-300
        bg-white px-3 py-1 text-sm shadow-sm
        focus:outline-none focus:ring-2 focus:ring-slate-400
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  );
}

export { Input };