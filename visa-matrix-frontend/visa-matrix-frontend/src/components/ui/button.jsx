import React from "react";

function Button({
  children,
  className = "",
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const variantClasses = {
    default: "vm-btn--primary",
    destructive: "vm-btn--primary",
    outline: "vm-btn--outline",
    secondary: "vm-btn--secondary",
    ghost: "vm-btn--ghost",
    link: "vm-btn--ghost",
  };

  const sizeClasses = {
    default: "",
    sm: "vm-btn--sm",
    lg: "vm-btn--lg",
    icon: "vm-btn--icon",
  };

  const classes = [
    "vm-btn",
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size] || sizeClasses.default,
    className,
  ]
    .filter(Boolean)
    .join(" ");

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