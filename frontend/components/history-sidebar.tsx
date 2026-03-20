import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { formatTimestamp } from "@/components/output-format";
import type { SearchRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MdHistory } from "react-icons/md";

type HistorySidebarProps = {
  filteredHistory: SearchRecord[];
  historyFilter: string;
  isBootstrapping: boolean;
  currentRecordId?: string;
  onFilterChange: (value: string) => void;
  onSelect: (id: string) => void;
};

export function HistorySidebar({
  filteredHistory,
  historyFilter,
  isBootstrapping,
  currentRecordId,
  onFilterChange,
  onSelect,
}: HistorySidebarProps) {
  const { open } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#534532]">
          <MdHistory className="size-4" aria-hidden="true" />
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em]">Conversations</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {open ? (
          <div className="space-y-3">
            <Input
              value={historyFilter}
              onChange={(event) => onFilterChange(event.target.value)}
              placeholder="Search history"
              className="h-10 rounded-xl border-[#ded6c7] bg-white/95"
            />

            {isBootstrapping ? (
              <p className="text-sm text-[#7b6a52]">Loading history...</p>
            ) : filteredHistory.length === 0 ? (
              <p className="text-sm text-[#7b6a52]">No sessions yet.</p>
            ) : (
              <div className="space-y-1.5">
                {filteredHistory.map((item) => (
                  <button
                    key={`sidebar-${item.id}`}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      "w-full rounded-xl px-3 py-2.5 text-left transition",
                      item.id === currentRecordId
                        ? "bg-[#ebe4d7] text-[#2f2214]"
                        : "bg-transparent text-[#564939] hover:bg-[#ece5d9]",
                    )}
                  >
                    <p className="line-clamp-1 text-sm font-medium">{item.venueName}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-[#73644f]">{item.prompt}</p>
                    <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-[#8f7d67]">
                      {formatTimestamp(item.createdAt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </SidebarContent>
    </Sidebar>
  );
}
