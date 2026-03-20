"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HistorySidebar } from "@/components/history-sidebar";
import { Input } from "@/components/ui/input";
import {
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  formatTimestamp,
  getOrCreateUserId,
  InfoTile,
  toSearchRecord,
} from "@/components/output-format";
import type { ApiProposal, SearchRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  MdBusinessCenter,
  MdLandscape,
  MdWaves,
} from "react-icons/md";

const USER_STORAGE_KEY = "louder-event-concierge-user-id";
const PROMPT_STORAGE_KEY = "louder-event-concierge-last-prompt";

const starterPrompts = [
  {
    icon: MdLandscape,
    label: "Need a mountain retreat?",
    prompt: "A 12-person leadership retreat in the mountains for 3 days with a $5k budget",
  },
  {
    icon: MdBusinessCenter,
    label: "Need a city GTM kickoff?",
    prompt: "A 30-person GTM kickoff in a city for 2 days with premium logistics",
  },
  {
    icon: MdWaves,
    label: "Need a coastal offsite?",
    prompt: "A product strategy offsite for 18 people near the coast with workshops and team dinners",
  },
];

export function EventConcierge() {
  const [prompt, setPrompt] = useState(starterPrompts[0].prompt);
  const [history, setHistory] = useState<SearchRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [historyFilter, setHistoryFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [historyNotice, setHistoryNotice] = useState("");
  const userIdRef = useRef("");

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const userId = getOrCreateUserId(USER_STORAGE_KEY);
      userIdRef.current = userId;

      const storedPrompt = window.localStorage.getItem(PROMPT_STORAGE_KEY);
      if (storedPrompt) {
        setPrompt(storedPrompt);
      }

      try {
        const response = await fetch(`/api/v1/proposals?user_id=${encodeURIComponent(userId)}&limit=40`);

        if (!response.ok) {
          throw new Error("Unable to load proposal history");
        }

        const rows = (await response.json()) as ApiProposal[];
        if (cancelled) {
          return;
        }

        const mapped = rows.map(toSearchRecord);
        setHistory(mapped);
        setSelectedId(mapped[0]?.id ?? "");
        setHistoryNotice("");
      } catch {
        if (!cancelled) {
          setHistoryNotice("History is temporarily unavailable. You can still generate new proposals.");
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentRecord = history.find((item) => item.id === selectedId) ?? history[0] ?? null;

  const filteredHistory = useMemo(() => {
    const query = historyFilter.trim().toLowerCase();
    if (!query) {
      return history;
    }

    return history.filter((entry) => {
      return [entry.prompt, entry.venueName, entry.location].join(" ").toLowerCase().includes(query);
    });
  }, [history, historyFilter]);

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim() || isLoading || isBootstrapping) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const userId = userIdRef.current || getOrCreateUserId(USER_STORAGE_KEY);
    const sessionId = crypto.randomUUID();

    try {
      window.localStorage.setItem(PROMPT_STORAGE_KEY, prompt.trim());

      const response = await fetch("/api/v1/proposals/llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          user_id: userId,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Proposal generation failed");
      }

      const row = (await response.json()) as ApiProposal;
      const record = toSearchRecord(row);

      setHistory((current) => {
        const next = [record, ...current.filter((item) => item.id !== record.id)];
        return next.slice(0, 40);
      });
      setSelectedId(record.id);
    } catch {
      setErrorMessage("Could not generate proposal. Verify backend and Supabase table columns.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-[linear-gradient(180deg,#f8f3e8_0%,#f7f2e8_42%,#fcfaf6_100%)] text-[#1b160d]">
      <HistorySidebar
        filteredHistory={filteredHistory}
        historyFilter={historyFilter}
        isBootstrapping={isBootstrapping}
        currentRecordId={currentRecord?.id}
        onFilterChange={setHistoryFilter}
        onSelect={setSelectedId}
      />

      <SidebarInset>
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-3 pb-12 pt-4 sm:gap-10 sm:px-6 sm:pb-14 sm:pt-6 lg:px-8 lg:pt-10">
            <section className="relative overflow-hidden rounded-3xl border border-[#efe5d6] bg-white/72 p-4 shadow-[0_30px_70px_-45px_rgba(37,27,14,0.35)] sm:rounded-[34px] sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-[#e7b17a]/30 blur-3xl" />
              <div className="pointer-events-none absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-[#d0c7b0]/28 blur-3xl" />

              <div className="relative mx-auto max-w-3xl text-center">
                <Badge className="mb-3 text-sm font-semibold text-[#b56a2b] sm:mb-4 sm:text-base lg:text-lg">AI Event Concierge</Badge>
                <h1 className="text-balance text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#20170d] sm:text-4xl lg:text-5xl">
                  Plan corporate offsites with one prompt.
                </h1>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#6a5e4f] sm:mt-4 sm:text-base sm:leading-7 lg:text-lg">
                  Describe your event in natural language and get a structured venue recommendation backed by your Supabase session history.
                </p>

                <div className="mt-5 grid gap-2 sm:mt-6 sm:grid-cols-2 lg:grid-cols-3">
                  {starterPrompts.map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      onClick={() => setPrompt(example.prompt)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#e3d3bc] bg-[#fff8ec] px-3 py-2 text-sm text-[#6f5b44] transition hover:border-[#c79056] hover:text-[#8f511d]"
                    >
                      <example.icon className="size-4 shrink-0" aria-hidden="true" />
                      {example.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleGenerate} className="mx-auto mt-6 max-w-3xl sm:mt-7">
                  <div className="flex flex-col gap-3 rounded-2xl border border-[#e5d7c3] bg-[#fffaf3] p-3 shadow-[0_18px_50px_-36px_rgba(31,21,10,0.42)] sm:flex-row sm:items-center">
                    <Input
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder="A 20-person strategy offsite near the coast for 2 days with a $9k budget"
                      className="h-11 flex-1 rounded-xl border-[#e6d7c0] bg-white text-[14px] sm:h-12 sm:text-[15px]"
                    />
                    <Button
                      type="submit"
                      disabled={!prompt.trim() || isLoading || isBootstrapping}
                      className="h-11 w-full rounded-xl bg-[#b56a2b] px-6 text-white hover:bg-[#985622] sm:h-12 sm:w-auto"
                    >
                      {isLoading ? "AI is planning..." : "Generate"}
                    </Button>
                  </div>
                </form>

                {historyNotice ? (
                  <p className="mt-4 rounded-xl border border-[#ead7bf] bg-[#fff8ed] px-4 py-2 text-sm text-[#8c6d48]">
                    {historyNotice}
                  </p>
                ) : null}

                {errorMessage ? (
                  <p className="mt-4 rounded-xl border border-[#efb9b9] bg-[#fff4f4] px-4 py-2 text-sm text-[#8a2b2b]">
                    {errorMessage}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="space-y-4 sm:space-y-5">
              <Card className="border-[#e7dcc9] bg-white/82">
                <CardHeader>
                  <CardTitle className="text-xl tracking-[-0.03em] sm:text-2xl">Current Proposal</CardTitle>
                  <CardDescription>
                    {currentRecord
                      ? `${currentRecord.location} · ${formatTimestamp(currentRecord.createdAt)}`
                      : "Submit a prompt to generate your first recommendation."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!currentRecord ? (
                    <div className="rounded-2xl border border-dashed border-[#e2d4c0] bg-[#fdf7ef] p-6 text-sm text-[#6f624f]">
                      Waiting for a generated proposal.
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-[#e4d6bf] bg-[#fdf8f1] p-4 sm:p-5">
                        <p className="text-xs uppercase tracking-[0.15em] text-[#7f6f58]">Venue</p>
                        <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#22180d] sm:text-2xl">{currentRecord.venueName}</p>
                        <p className="mt-1 text-sm text-[#6d604e]">{currentRecord.location}</p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <InfoTile label="Estimated Cost" value={currentRecord.estimatedCost} />
                        <InfoTile label="Session ID" value={currentRecord.sessionId} mono />
                      </div>

                      <div className="rounded-2xl border border-[#e4d6bf] bg-white p-4 sm:p-5">
                        <p className="text-xs uppercase tracking-[0.15em] text-[#7f6f58]">Why It Fits</p>
                        <p className="mt-2 text-[15px] leading-7 text-[#3b2f20]">{currentRecord.whyItFits}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-[#e7dcc9] bg-white/82 lg:hidden">
                <CardHeader>
                  <CardTitle>History</CardTitle>
                  <CardDescription>Persisted searches for this user.</CardDescription>
                  <Input
                    value={historyFilter}
                    onChange={(event) => setHistoryFilter(event.target.value)}
                    placeholder="Filter history"
                    className="h-10"
                  />
                </CardHeader>
                <CardContent className="space-y-3">
                  {isBootstrapping ? (
                    <p className="text-sm text-[#7b6a52]">Loading history...</p>
                  ) : filteredHistory.length === 0 ? (
                    <p className="text-sm text-[#7b6a52]">No sessions yet.</p>
                  ) : (
                    filteredHistory.map((item) => (
                      <button
                        key={`mobile-${item.id}`}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={cn(
                          "w-full rounded-xl border p-3 text-left transition",
                          item.id === currentRecord?.id
                            ? "border-[#b56a2b] bg-[#fff2e2]"
                            : "border-[#e4d6bf] bg-white hover:border-[#d3b58f]",
                        )}
                      >
                        <p className="text-sm font-semibold text-[#2f2215]">{item.venueName}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-[#6e624f]">{item.prompt}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#978570]">
                          {formatTimestamp(item.createdAt)}
                        </p>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            </section>
        </main>
      </SidebarInset>
    </div>
  );
}

