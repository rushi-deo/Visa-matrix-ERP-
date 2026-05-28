import * as React from "react";

const SidebarContext = React.createContext(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }

  return context;
}

function SidebarProvider({ children }) {
  const [open, setOpen] = React.useState(true);

  const toggleSidebar = () => {
    setOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        toggleSidebar,
        state: open ? "expanded" : "collapsed",
      }}
    >
      <div className="flex w-full min-h-screen">
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({ children, className = "" }) {
  return (
    <aside
      className={`w-64 bg-slate-900 text-white min-h-screen ${className}`}
    >
      {children}
    </aside>
  );
}

function SidebarInset({ children, className = "" }) {
  return (
    <main className={`flex-1 bg-slate-50 ${className}`}>
      {children}
    </main>
  );
}

function SidebarHeader({ children }) {
  return (
    <div className="p-4 border-b border-slate-700">
      {children}
    </div>
  );
}

function SidebarContent({ children }) {
  return (
    <div className="p-4">
      {children}
    </div>
  );
}

function SidebarGroup({ children }) {
  return (
    <div className="mb-4">
      {children}
    </div>
  );
}

function SidebarGroupLabel({ children }) {
  return (
    <div className="text-xs uppercase text-slate-400 mb-2">
      {children}
    </div>
  );
}

function SidebarGroupContent({ children }) {
  return <div>{children}</div>;
}

function SidebarMenu({ children }) {
  return (
    <ul className="space-y-1">
      {children}
    </ul>
  );
}

function SidebarMenuItem({ children }) {
  return <li>{children}</li>;
}

function SidebarMenuButton({
  children,
  onClick,
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded hover:bg-slate-800 ${className}`}
    >
      {children}
    </button>
  );
}

function SidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="p-2 border rounded"
    >
      Toggle
    </button>
  );
}

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