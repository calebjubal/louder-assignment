"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";

export function Navbar() {
  const { open, toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-20 border-b border-[#e7dcc8] bg-[#fbf6ed]/90 backdrop-blur supports-backdrop-filter:bg-[#fbf6ed]/80">
      <div className="flex min-h-16 w-full items-center justify-between gap-2 px-2 py-2 sm:gap-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#b56a2b]" />
          <span className="text-sm font-semibold tracking-[0.14em] text-[#2f2214]">LOUDER</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={toggle}
            className="hidden size-9 border-[#dbc8ad] bg-[#fff9f0] text-[#7f4d20] hover:bg-[#f7ead8] lg:inline-flex"
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            title={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? <GoSidebarCollapse className="size-4" /> : <GoSidebarExpand className="size-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
