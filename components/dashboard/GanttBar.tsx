"use client";

import { formatDisplayDate } from "@/lib/assignments/capacity";
import { getBarPosition } from "@/lib/dashboard/roadmap";
import type { BarPosition, TimelineRange } from "@/lib/dashboard/roadmap";

interface GanttBarProps {
  barStart: string;
  barEnd: string;
  range: TimelineRange;
  colorClass: string;
  label: string;
}

export function GanttBar({
  barStart,
  barEnd,
  range,
  colorClass,
  label,
}: GanttBarProps) {
  const pos = getBarPosition(barStart, barEnd, range);
  if (!pos) return null;

  return (
    <div
      className={`absolute top-1/2 h-6 -translate-y-1/2 rounded px-1.5 text-[10px] font-medium leading-6 text-white shadow-sm truncate ${colorClass}`}
      style={{ left: `${pos.left}%`, width: `${pos.width}%`, minWidth: "4px" }}
      title={`${label}: ${formatDisplayDate(barStart)} → ${formatDisplayDate(barEnd)}`}
    >
      {pos.width > 8 ? label : ""}
    </div>
  );
}

interface GanttTrackProps {
  todayLeft: number | null;
  children: React.ReactNode;
  className?: string;
}

export function GanttTrack({
  todayLeft,
  children,
  className = "",
}: GanttTrackProps) {
  return (
    <div
      className={`relative h-10 flex-1 min-w-[320px] border-l border-zinc-100 bg-zinc-50/50 ${className}`}
    >
      {todayLeft != null && (
        <div
          className="absolute top-0 bottom-0 z-10 w-0.5 bg-blue-500"
          style={{ left: `${todayLeft}%` }}
        />
      )}
      {children}
    </div>
  );
}

interface TimelineHeaderProps {
  monthMarkers: { label: string; left: number }[];
  todayLeft: number | null;
}

export function TimelineHeader({ monthMarkers, todayLeft }: TimelineHeaderProps) {
  return (
    <div className="relative h-8 flex-1 min-w-[320px] border-l border-zinc-200 bg-zinc-50">
      {monthMarkers.map((marker, i) => (
        <div
          key={i}
          className="absolute top-0 flex h-full items-center border-l border-zinc-200 pl-2 text-xs font-medium text-zinc-500"
          style={{ left: `${marker.left}%` }}
        >
          {marker.label}
        </div>
      ))}
      {todayLeft != null && (
        <div
          className="absolute -top-0.5 z-10 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white"
          style={{ left: `${todayLeft}%` }}
        >
          •
        </div>
      )}
    </div>
  );
}

export type { BarPosition, TimelineRange };
