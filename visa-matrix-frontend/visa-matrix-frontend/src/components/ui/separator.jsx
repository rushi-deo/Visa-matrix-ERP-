import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

function Separator({
  className = "",
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={`
        shrink-0 bg-slate-200
        ${orientation === "horizontal" ? "h-px w-full" : "h-full w-px"}
        ${className}
      `}
      {...props}
    />
  );
}

export { Separator };