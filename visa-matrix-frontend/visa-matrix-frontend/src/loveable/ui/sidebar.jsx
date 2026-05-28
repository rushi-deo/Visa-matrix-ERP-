import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SidebarContext = React.createContext(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }

  return context;
}

const SidebarProvider = React.forwardRef(
  (
    {
      defaultOpen = true,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile();

    const [open, setOpen] = React.useState(defaultOpen);

    const toggleSidebar = () => {
      setOpen((prev) => !prev);
    };

    const value = {
      open,
      setOpen,
      isMobile,
      toggleSidebar,
      state: open ? "expanded" : "collapsed",
    };

    return (
      <SidebarContext.Provider value={value}>
        <TooltipProvider delayDuration={0}>
          <div
            ref={ref}
            style={style}
            className={cn(
              "group/sidebar-wrapper flex min-h-screen w-full",
              className
            )}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  }
);

SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "hidden md:flex md:flex-col border-r bg-background",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Sidebar.displayName = "Sidebar";

const SidebarTrigger = React.forwardRef(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", className)}
        onClick={(e) => {
          onClick?.(e);
          toggleSidebar();
        }}
        {...props}
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
    );
  }
);

SidebarTrigger.displayName = "SidebarTrigger";

const SidebarInset = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          "relative flex w-full flex-1 flex-col bg-background",
          className
        )}
        {...props}
      />
    );
  }
);

SidebarInset.displayName = "SidebarInset";

const SidebarHeader = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-2 p-2", className)}
        {...props}
      />
    );
  }
);

SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-1 flex-col gap-2 overflow-auto",
          className
        )}
        {...props}
      />
    );
  }
);

SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col p-2", className)}
        {...props}
      />
    );
  }
);

SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        className={cn(
          "px-2 py-1 text-xs font-medium text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);

SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupContent = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full text-sm", className)}
        {...props}
      />
    );
  }
);

SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn("flex flex-col gap-1", className)}
        {...props}
      />
    );
  }
);

SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("relative", className)}
        {...props}
      />
    );
  }
);

SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground"
);

const SidebarMenuButton = React.forwardRef(
  (
    {
      asChild = false,
      isActive = false,
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const button = (
      <Comp
        ref={ref}
        className={cn(
          sidebarMenuButtonVariants(),
          isActive && "bg-accent font-medium",
          className
        )}
        {...props}
      />
    );

    if (!tooltip) {
      return button;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>

        <TooltipContent side="right">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }
);

SidebarMenuButton.displayName = "SidebarMenuButton";

export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};