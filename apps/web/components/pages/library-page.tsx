"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api, type JournalShowStatus } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { statusLabel } from "@/lib/format";
import { useAdminSession } from "@/lib/hooks/use-admin-session";
import { LibraryShowCard } from "@/components/journal/show-cards";
import { EmptyState, PageHeader } from "@/components/journal/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const filters: Array<{ id: JournalShowStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "watching", label: "Watching" },
  { id: "completed", label: "Completed" },
  { id: "plan-to-watch", label: "Plan To Watch" },
  { id: "on-hold", label: "On Hold" },
];

function matchesSearch(show: { showNameSnapshot: string; networkSnapshot?: string | null; genresSnapshot?: string[] | null }, query: string) {
  const haystack = [
    show.showNameSnapshot,
    show.networkSnapshot ?? "",
    ...(show.genresSnapshot ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function LibraryPage() {
  const [filter, setFilter] = useState<JournalShowStatus | "all">("all");
  const [search, setSearch] = useState("");
  const { data: admin } = useAdminSession();

  const { data: shows, isLoading, error } = useQuery({
    queryKey: queryKeys.shows,
    queryFn: () => api.publicShows().then((r) => r.shows),
  });

  const filtered = useMemo(() => {
    if (!shows) return [];
    let list = filter === "all" ? shows : shows.filter((show) => show.status === filter);
    const query = search.trim();
    if (admin && query) {
      list = list.filter((show) => matchesSearch(show, query));
    }
    return list;
  }, [shows, filter, search, admin]);

  return (
    <div>
      <PageHeader
        eyebrow="Library"
        title="Your shows"
        description={`${shows?.length ?? 0} shows in your journal.${admin ? " Search and update progress below." : ""}`}
      />

      {admin ? (
        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shows by title, network, or genre…"
            className="pl-9"
          />
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-all",
              filter === item.id ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <EmptyState title="Failed to load library" description={error.message} /> : null}
      {isLoading ? (
        <div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
      ) : filtered.length ? (
        <div className="grid gap-4">
          {filtered.map((show) => (
            <LibraryShowCard key={show.id} show={show} adminActions={Boolean(admin)} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            admin && search.trim()
              ? "No matching shows"
              : `No ${filter === "all" ? "" : statusLabel(filter as JournalShowStatus).toLowerCase() + " "}shows`
          }
          description={admin && search.trim() ? "Try a different search term or clear the search box." : undefined}
        />
      )}
    </div>
  );
}
