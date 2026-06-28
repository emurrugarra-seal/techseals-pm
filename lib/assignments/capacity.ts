import type { Assignment, AssignmentSegment } from "@/lib/types";

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** ISO `YYYY-MM-DD` → display `DD-MM-YYYY` */
export function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
}

export function daysInclusive(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

export function segmentWeeklyHours(segment: AssignmentSegment): number {
  const weekly =
    segment.hoursPerWeek != null ? Number(segment.hoursPerWeek) : NaN;
  if (!Number.isNaN(weekly) && weekly > 0) {
    return weekly;
  }

  const total =
    segment.totalHours != null ? Number(segment.totalHours) : NaN;
  if (!Number.isNaN(total) && total > 0) {
    const start = parseDate(segment.startDate);
    const end = parseDate(segment.endDate);
    const days = daysInclusive(start, end);
    return total / Math.max(days / 7, 1 / 7);
  }

  return 0;
}

export function segmentWeeklyHoursInRange(
  segment: AssignmentSegment,
  rangeStart: string,
  rangeEnd: string,
): number {
  if (!rangesOverlap(segment.startDate, segment.endDate, rangeStart, rangeEnd)) {
    return 0;
  }
  return segmentWeeklyHours(segment);
}

export function assignmentWeeklyHoursInRange(
  assignment: Assignment,
  rangeStart: string,
  rangeEnd: string,
): number {
  return assignment.segments.reduce(
    (sum, segment) =>
      sum + segmentWeeklyHoursInRange(segment, rangeStart, rangeEnd),
    0,
  );
}

/** Hours to show in the mission matrix: active segment today, or next upcoming. */
export function assignmentDisplayWeeklyHours(
  assignment: Assignment,
  asOfDate: string = todayIso(),
): number {
  const segments = [...assignment.segments].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );

  const active = segments.filter(
    (segment) =>
      segment.startDate <= asOfDate && segment.endDate >= asOfDate,
  );
  if (active.length > 0) {
    return active.reduce(
      (sum, segment) => sum + segmentWeeklyHours(segment),
      0,
    );
  }

  const upcoming = segments.find((segment) => segment.endDate >= asOfDate);
  if (upcoming) {
    return segmentWeeklyHours(upcoming);
  }

  return 0;
}

export function assignmentHasMission(
  assignment: Assignment,
  asOfDate: string = todayIso(),
): boolean {
  return assignment.segments.some((segment) => segment.endDate >= asOfDate);
}

export function consultantWeeklyHoursInRange(
  assignments: Assignment[],
  consultantId: string,
  rangeStart: string,
  rangeEnd: string,
): number {
  return assignments
    .filter((a) => a.consultantId === consultantId)
    .reduce(
      (sum, assignment) =>
        sum + assignmentWeeklyHoursInRange(assignment, rangeStart, rangeEnd),
      0,
    );
}

export function getMonthRange(year: number, month: number): {
  start: string;
  end: string;
} {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start: formatDate(start), end: formatDate(end) };
}

export function getUpcomingMonths(count: number): { year: number; month: number; label: string }[] {
  const result: { year: number; month: number; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    result.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: date.toLocaleDateString("en", { month: "short", year: "numeric" }),
    });
  }

  return result;
}

export function capacityColorClass(
  assignedHours: number,
  capacityHours: number,
): string {
  if (assignedHours === 0) return "bg-white text-zinc-400";
  const ratio = assignedHours / Math.max(capacityHours, 1);
  if (ratio > 1) return "bg-red-100 text-red-800 font-medium";
  if (ratio >= 0.8) return "bg-amber-100 text-amber-800";
  return "bg-green-50 text-green-800";
}

export function findAssignment(
  assignments: Assignment[],
  consultantId: string,
  projectId: string,
): Assignment | undefined {
  return assignments.find(
    (a) => a.consultantId === consultantId && a.projectId === projectId,
  );
}

export function todayIso(): string {
  return formatDate(new Date());
}

export function addDays(iso: string, days: number): string {
  const date = parseDate(iso);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function newSegmentId(): string {
  return crypto.randomUUID();
}
