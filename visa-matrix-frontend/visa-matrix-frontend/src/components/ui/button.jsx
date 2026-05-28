import React from "react";

function Button({
  children,
  className = "",
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-slate-300 bg-white hover:bg-slate-100",
    secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300",
    ghost: "hover:bg-slate-100",
    link: "text-blue-600 underline hover:text-blue-800",
  };

  const sizeClasses = {
    default: "h-9 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-10 px-8",
    icon: "h-9 w-9",
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.default}
    ${sizeClasses[size] || sizeClasses.default}
    ${className}
  `;

  if (asChild) {
    return React.cloneElement(children, {
      className: `${children.props.className || ""} ${classes}`,
      ...props,
    });
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export { Button };