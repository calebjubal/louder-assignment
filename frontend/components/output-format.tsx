import { cn } from "@/lib/utils";
import type { ApiProposal, SearchRecord } from "@/lib/types";

export function InfoTile({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-[#e4d6bf] bg-[#fdf8f1] p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-[#7f6f58]">{label}</p>
      <p className={cn("mt-2 text-sm text-[#3b2f20]", mono ? "break-all font-mono" : "font-semibold")}>{value}</p>
    </div>
  );
}

export function getOrCreateUserId(storageKey: string) {
  const existing = window.localStorage.getItem(storageKey);
  if (existing) {
    return existing;
  }

  const generated = `user-${crypto.randomUUID()}`;
  window.localStorage.setItem(storageKey, generated);
  return generated;
}

export function toSearchRecord(row: ApiProposal): SearchRecord {
  return {
    id: row._id,
    sessionId: row.session_id,
    prompt: row.request,
    venueName: row.proposal.venue_name,
    location: row.proposal.location,
    estimatedCost: row.proposal.estimated_cost,
    whyItFits: row.proposal.why_it_fits,
    createdAt: row.created_at,
  };
}

export function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
