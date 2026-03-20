"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((current) => !current),
    }),
    [open],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function Sidebar({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-20 hidden h-[calc(100vh-4rem)] overflow-hidden border-r bg-[#f7f5f1] transition-[width,border-color,box-shadow] duration-300 lg:flex lg:flex-col",
        open ? "w-72 border-[#e4ded2] shadow-[10px_0_28px_-20px_rgba(40,33,22,0.35)]" : "w-0 border-transparent shadow-none",
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarInset({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = useSidebar();

  return (
    <div
      className={cn(
        "transition-[margin] duration-300",
        open ? "lg:ml-72" : "lg:ml-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SidebarHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border-b border-[#e4ded2] p-3.5", className)}>{children}</div>;
}

export function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex-1 overflow-y-auto p-3.5", className)}>{children}</div>;
}

export function SidebarTrigger({
  icon,
  label,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
}) {
  const { toggle } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn("size-9 text-[#7a5a37] hover:bg-[#f6ead8] hover:text-[#9a5d26]", className)}
      aria-label={label}
      title={label}
    >
      {icon}
    </Button>
  );
}
