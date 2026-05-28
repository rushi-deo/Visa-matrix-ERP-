import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

function SheetOverlay({ className = "", ...props }) {
  return (
    <SheetPrimitive.Overlay
      className={`
        fixed inset-0 z-50 bg-black/80
        ${className}
      `}
      {...props}
    />
  );
}

function SheetContent({
  side = "right",
  className = "",
  children,
  ...props
}) {
  const sideClasses = {
    top: "top-0 left-0 right-0 border-b",
    bottom: "bottom-0 left-0 right-0 border-t",
    left: "left-0 top-0 h-full w-3/4 max-w-sm border-r",
    right: "right-0 top-0 h-full w-3/4 max-w-sm border-l",
  };

  return (
    <SheetPortal>
      <SheetOverlay />

      <SheetPrimitive.Content
        className={`
          fixed z-50 bg-white p-6 shadow-lg
          ${sideClasses[side]}
          ${className}
        `}
        {...props}
      >
        <SheetPrimitive.Close
          className="absolute right-4 top-4 opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </SheetPrimitive.Close>

        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({
  className = "",
  ...props
}) {
  return (
    <div
      className={`flex flex-col space-y-2 ${className}`}
      {...props}
    />
  );
}

function SheetFooter({
  className = "",
  ...props
}) {
  return (
    <div
      className={`flex justify-end gap-2 ${className}`}
      {...props}
    />
  );
}

function SheetTitle({
  className = "",
  ...props
}) {
  return (
    <SheetPrimitive.Title
      className={`text-lg font-semibold ${className}`}
      {...props}
    />
  );
}

function SheetDescription({
  className = "",
  ...props
}) {
  return (
    <SheetPrimitive.Description
      className={`text-sm text-slate-500 ${className}`}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};