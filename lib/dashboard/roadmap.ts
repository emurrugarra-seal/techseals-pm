import { parseDate, formatDate, todayIso } from "@/lib/assignments/capacity";
import type { Assignment, Project, ProjectStatus } from "@/lib/types";

export interface TimelineRange {
  start: string;
  end: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
}

export interface BarPosition {
  left: number;
  width: number;
}

export interface TimelineSegment {
  id: string;
  startDate: string;
  endDate: string;
  label: string;
  colorClass: string;
}

export function getDefaultTimelineRange(): TimelineRange {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1);
  const endDate = new Date(now.getFullYear(), 11, 31);
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const totalDays =
    Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
  return { start, end, startDate, endDate, totalDays };
}

export function getBarPosition(
  barStart: string,
  barEnd: string,
  range: TimelineRange,
): BarPosition | null {
  const clampedStart = barStart < range.start ? range.start : barStart;
  const clampedEnd = barEnd > range.end ? range.end : barEnd;
  if (clampedStart > range.end || clampedEnd < range.start) return null;

  const startOffset = daysBetween(range.startDate, parseDate(clampedStart));
  const duration = daysBetween(parseDate(clampedStart), parseDate(clampedEnd));

  const left = (startOffset / range.totalDays) * 100;
  const width = Math.max((duration / range.totalDays) * 100, 0.8);
  return { left, width };
}

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86400000);
}

export function getMonthMarkers(range: TimelineRange): {
  label: string;
  left: number;
}[] {
  const markers: { label: string; left: number }[] = [];
  let cursor = new Date(range.startDate.getFullYear(), range.startDate.getMonth(), 1);

  while (cursor <= range.endDate) {
    const iso = formatDate(cursor);
    if (iso >= range.start && iso <= range.end) {
      const offset = daysBetween(range.startDate, cursor);
      markers.push({
        label: cursor.toLocaleDateString("en", { month: "short" }),
        left: (offset / range.totalDays) * 100,
      });
    }
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  return markers;
}

export function getTodayMarkerLeft(range: TimelineRange): number | null {
  const today = todayIso();
  if (today < range.start || today > range.end) return null;
  const offset = daysBetween(range.startDate, parseDate(today));
  return (offset / range.totalDays) * 100;
}

export function projectStatusColor(status: ProjectStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-500";
    case "planned":
      return "bg-blue-500";
    case "paused":
      return "bg-amber-400";
    case "completed":
      return "bg-zinc-400";
    case "cancelled":
      return "bg-red-400";
    default:
      return "bg-zinc-400";
  }
}

export function projectStatusBadge(status: ProjectStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-800";
    case "planned":
      return "bg-blue-100 text-blue-800";
    case "paused":
      return "bg-amber-100 text-amber-800";
    case "completed":
      return "bg-zinc-100 text-zinc-600";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-zinc-100 text-zinc-600";
  }
}

export function getProjectAssigneeIds(
  projectId: string,
  assignments: Assignment[],
): string[] {
  return assignments
    .filter((a) => a.projectId === projectId && a.segments.length > 0)
    .map((a) => a.consultantId);
}

export function getConsultantFreeDate(
  consultantId: string,
  assignments: Assignment[],
): string | null {
  const today = todayIso();
  let latestEnd: string | null = null;

  for (const assignment of assignments.filter(
    (a) => a.consultantId === consultantId,
  )) {
    for (const segment of assignment.segments) {
      if (segment.endDate >= today) {
        if (!latestEnd || segment.endDate > latestEnd) {
          latestEnd = segment.endDate;
        }
      }
    }
  }

  return latestEnd;
}

export function getConsultantTimelineSegments(
  consultantId: string,
  assignments: Assignment[],
  projectNames: Map<string, string>,
): TimelineSegment[] {
  const today = todayIso();
  const colors = [
    "bg-indigo-500",
    "bg-violet-500",
    "bg-cyan-500",
    "bg-teal-500",
    "bg-orange-500",
  ];
  let colorIdx = 0;
  const segments: TimelineSegment[] = [];

  for (const assignment of assignments.filter(
    (a) => a.consultantId === consultantId,
  )) {
    for (const segment of assignment.segments) {
      if (segment.endDate < today) continue;
      segments.push({
        id: `${assignment.id}-${segment.id}`,
        startDate: segment.startDate,
        endDate: segment.endDate,
        label: projectNames.get(assignment.projectId) ?? "Project",
        colorClass: colors[colorIdx % colors.length]!,
      });
      colorIdx++;
    }
  }

  return segments.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function daysUntil(isoDate: string): number {
  const today = parseDate(todayIso());
  const target = parseDate(isoDate);
  return daysBetween(today, target);
}

export function sortProjectsForRoadmap(projects: Project[]): Project[] {
  const today = todayIso();
  return projects
    .filter(
      (p) =>
        p.status !== "completed" &&
        p.status !== "cancelled" &&
        p.endDate >= today,
    )
    .sort((a, b) => a.endDate.localeCompare(b.endDate));
}
