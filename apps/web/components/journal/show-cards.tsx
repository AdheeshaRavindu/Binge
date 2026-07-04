"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { JournalShowSummary } from "@/lib/api";
import { adminShowPath } from "@/lib/admin-path";
import { episodeCode, showPath, statusLabel } from "@/lib/format";
import { useEpisodeMutations } from "@/lib/hooks/use-episode-mutations";
import { ShowProgress } from "./shared";
import { ShowPoster } from "./show-poster";

export function ContinueWatchingCard({ show, priority = false }: { show: JournalShowSummary; priority?: boolean }) {
  return (
    <article className="group card-glow w-[220px] shrink-0 overflow-hidden rounded-2xl border bg-card transition-all duration-300 md:w-[260px]">
      <Link href={showPath(show.id)} className="block">
        <ShowPoster src={show.imageSnapshot} alt={show.showNameSnapshot} className="aspect-[2/3] w-full" priority={priority} />
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <Link href={showPath(show.id)} className="line-clamp-1 font-semibold transition-colors hover:text-primary">
            {show.showNameSnapshot}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            {statusLabel(show.status)} · {episodeCode(show.currentSeason, show.currentEpisode)}
          </p>
        </div>
        <ShowProgress show={show} />
        {show.nextEpisode ? (
          <p className="text-xs text-muted-foreground">
            Up next: {episodeCode(show.nextEpisode.season, show.nextEpisode.number)}
          </p>
        ) : null}
        <Button asChild size="sm" className="w-full">
          <Link href={showPath(show.id)}>
            Open
          </Link>
        </Button>
      </div>
    </article>
  );
}

function LibraryShowAdminActions({ show }: { show: JournalShowSummary }) {
  const [season, setSeason] = useState(String(show.currentSeason ?? 1));
  const { markNext, markSeasonWatched, isPending } = useEpisodeMutations();

  const seasonNumber = Number.parseInt(season, 10);

  return (
    <div className="flex flex-col gap-2 border-t pt-3">
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="secondary">
          <Link href={adminShowPath(show.id) as "/"}>
            <Pencil className="size-3.5" />
            Track
          </Link>
        </Button>
        <Button size="sm" variant="secondary" disabled={isPending} onClick={() => markNext.mutate(show.id)}>
          <Check className="size-3.5" />
          Mark next
        </Button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label htmlFor={`season-${show.id}`} className="shrink-0 text-xs text-muted-foreground">
            Season
          </label>
          <Input
            id={`season-${show.id}`}
            type="number"
            min={1}
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="h-8 w-20"
          />
        </div>
        <Button
          size="sm"
          className="w-full sm:w-auto"
          disabled={isPending || !Number.isInteger(seasonNumber) || seasonNumber < 1}
          onClick={() => markSeasonWatched.mutate({ showId: show.id, season: seasonNumber })}
        >
          Mark season watched
        </Button>
      </div>
    </div>
  );
}

export function LibraryShowCard({ show, adminActions = false }: { show: JournalShowSummary; adminActions?: boolean }) {
  return (
    <article className="group card-glow overflow-hidden rounded-2xl border bg-card transition-all duration-300">
      <div className="grid gap-4 p-4 md:grid-cols-[140px_1fr]">
        <Link href={showPath(show.id)}>
          <ShowPoster src={show.imageSnapshot} alt={show.showNameSnapshot} className="aspect-[2/3] w-full md:w-[140px]" />
        </Link>
        <div className="flex min-w-0 flex-col justify-between gap-3">
          <div className="space-y-2">
            <Link href={showPath(show.id)} className="text-lg font-semibold transition-colors hover:text-primary">
              {show.showNameSnapshot}
            </Link>
            <p className="text-sm text-muted-foreground">
              {[show.yearSnapshot, show.networkSnapshot, ...(show.genresSnapshot?.slice(0, 2) ?? [])].filter(Boolean).join(" · ")}
            </p>
            <ShowProgress show={show} />
          </div>
          <div className="space-y-2">
            <Button asChild size="sm" variant="secondary">
              <Link href={showPath(show.id)}>
                View
                <ChevronRight className="size-3.5" />
              </Link>
            </Button>
            {adminActions ? <LibraryShowAdminActions show={show} /> : null}
          </div>
        </div>
      </div>
    </article>
  );
}
