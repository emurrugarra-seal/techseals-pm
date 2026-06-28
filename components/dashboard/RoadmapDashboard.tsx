"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CapacityMatrix } from "@/components/assignments/CapacityMatrix";
import { GanttBar, GanttTrack, TimelineHeader } from "@/components/dashboard/GanttBar";
import {
  consultantWeeklyHoursInRange,
  formatDisplayDate,
  getYearMonths,
  todayIso,
} from "@/lib/assignments/capacity";
import {
  getConsultantFreeDate,
  getConsultantTimelineSegments,
  getDefaultTimelineRange,
  getMonthMarkers,
  getProjectAssigneeIds,
  getTodayMarkerLeft,
  initials,
  projectStatusBadge,
  projectStatusColor,
  sortProjectsForRoadmap,
} from "@/lib/dashboard/roadmap";
import { db } from "@/lib/firebase/client";
import type { Assignment, Client, Consultant, Project } from "@/lib/types";

export function RoadmapDashboard() {
  const t = useTranslations("dashboard");
  const tProjects = useTranslations("projects");
  const tCommon = useTranslations("common");

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [projectsSnap, clientsSnap, consultantsSnap, assignmentsSnap] =
        await Promise.all([
          getDocs(collection(db, "projects")),
          getDocs(collection(db, "clients")),
          getDocs(collection(db, "consultants")),
          getDocs(collection(db, "assignments")),
        ]);

      setProjects(
        projectsSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Project, "id">),
        })),
      );
      setClients(
        clientsSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Client, "id">),
        })),
      );
      setConsultants(
        consultantsSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Consultant, "id">),
        })),
      );
      setAssignments(
        assignmentsSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Assignment, "id">),
        })),
      );
      setLoading(false);
    }

    load();
  }, []);

  const range = useMemo(() => getDefaultTimelineRange(), []);
  const monthMarkers = useMemo(() => getMonthMarkers(range), [range]);
  const todayLeft = useMemo(() => getTodayMarkerLeft(range), [range]);
  const capacityMonths = useMemo(
    () => getYearMonths(range.startDate.getFullYear()),
    [range],
  );
  const today = todayIso();

  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c.name])),
    [clients],
  );

  const consultantMap = useMemo(
    () => new Map(consultants.map((c) => [c.id, c])),
    [consultants],
  );

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p.name])),
    [projects],
  );

  const roadmapProjects = useMemo(
    () => sortProjectsForRoadmap(projects),
    [projects],
  );

  const sortedConsultants = useMemo(() => {
    return consultants
      .filter((c) => c.active)
      .map((c) => ({
        consultant: c,
        freeDate: getConsultantFreeDate(c.id, assignments),
        hours: consultantWeeklyHoursInRange(assignments, c.id, today, today),
        segments: getConsultantTimelineSegments(c.id, assignments, projectMap),
      }))
      .sort((a, b) => {
        if (!a.freeDate && !b.freeDate) return a.consultant.name.localeCompare(b.consultant.name);
        if (!a.freeDate) return -1;
        if (!b.freeDate) return 1;
        return a.freeDate.localeCompare(b.freeDate);
      });
  }, [consultants, assignments, projectMap, today]);

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === "active").length;
    const ending30 = roadmapProjects.filter((p) => {
      const end = new Date(p.endDate);
      const limit = new Date();
      limit.setDate(limit.getDate() + 30);
      return end <= limit;
    }).length;
    const unassigned = projects.filter(
      (p) =>
        p.status === "active" &&
        getProjectAssigneeIds(p.id, assignments).length === 0,
    ).length;
    return { active, ending30, unassigned, consultants: sortedConsultants.length };
  }, [projects, roadmapProjects, assignments, sortedConsultants.length]);

  if (loading) {
    return <p className="mt-6 text-sm text-zinc-500">{t("loading")}</p>;
  }

  return (
    <div className="mt-4 space-y-8">
      {/* Summary strip */}
      <div className="flex flex-wrap gap-4 text-sm">
        <StatPill label={t("statActiveProjects")} value={stats.active} />
        <StatPill label={t("statConsultants")} value={stats.consultants} />
        <StatPill
          label={t("statEnding30")}
          value={stats.ending30}
          highlight={stats.ending30 > 0}
        />
        {stats.unassigned > 0 && (
          <StatPill
            label={t("statUnassigned")}
            value={stats.unassigned}
            alert
          />
        )}
      </div>

      {/* Projects roadmap */}
      <section className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="border-b border-zinc-200 px-4 py-3">
          <h2 className="font-semibold text-zinc-900">{t("projectsRoadmap")}</h2>
          <p className="text-sm text-zinc-500">{t("projectsRoadmapHint")}</p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header row */}
            <div className="flex border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
              <div className="w-[280px] shrink-0 px-4 py-2">{t("colWork")}</div>
              <div className="w-[100px] shrink-0 px-2 py-2">{tCommon("status")}</div>
              <div className="w-[100px] shrink-0 px-2 py-2">{t("colAssignees")}</div>
              <div className="w-[100px] shrink-0 px-2 py-2">{t("colEnds")}</div>
              <TimelineHeader monthMarkers={monthMarkers} todayLeft={todayLeft} />
            </div>

            {roadmapProjects.length === 0 ? (
              <div className="px-4 py-8 text-sm text-zinc-500">
                {t("noProjects")}{" "}
                <Link href="/admin/operations/projects/new" className="underline text-zinc-700">
                  {t("addProjectLink")}
                </Link>
              </div>
            ) : (
              roadmapProjects.map((project) => {
                const assigneeIds = getProjectAssigneeIds(project.id, assignments);
                const daysLeft = Math.ceil(
                  (parseDate(project.endDate).getTime() - parseDate(today).getTime()) /
                    86400000,
                );

                return (
                  <div
                    key={project.id}
                    className="flex border-b border-zinc-100 hover:bg-zinc-50/80"
                  >
                    <div className="flex w-[280px] shrink-0 items-center gap-2 px-4 py-2">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/operations/projects/${project.id}/edit`}
                          className="block truncate text-sm font-medium text-zinc-900 hover:underline"
                        >
                          {project.name}
                        </Link>
                        <div className="truncate text-xs text-zinc-500">
                          {clientMap.get(project.clientId) ?? "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex w-[100px] shrink-0 items-center px-2 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${projectStatusBadge(project.status)}`}
                      >
                        {tProjects(`statuses.${project.status}`)}
                      </span>
                    </div>

                    <div className="flex w-[100px] shrink-0 items-center gap-1 px-2 py-2">
                      {assigneeIds.length === 0 ? (
                        <span className="text-xs text-amber-600">{t("noAssignees")}</span>
                      ) : (
                        assigneeIds.slice(0, 3).map((id) => {
                          const c = consultantMap.get(id);
                          if (!c) return null;
                          return (
                            <span
                              key={id}
                              title={c.name}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-700"
                            >
                              {initials(c.name)}
                            </span>
                          );
                        })
                      )}
                    </div>

                    <div className="flex w-[100px] shrink-0 flex-col justify-center px-2 py-2">
                      <span className="text-sm font-medium text-zinc-900">
                        {formatDisplayDate(project.endDate)}
                      </span>
                      <span
                        className={`text-[11px] ${daysLeft <= 30 ? "text-amber-600 font-medium" : "text-zinc-500"}`}
                      >
                        {daysLeft <= 0 ? t("ended") : t("daysLeft", { days: daysLeft })}
                      </span>
                    </div>

                    <GanttTrack todayLeft={todayLeft}>
                      <GanttBar
                        barStart={project.startDate}
                        barEnd={project.endDate}
                        range={range}
                        colorClass={projectStatusColor(project.status)}
                        label={project.name}
                      />
                    </GanttTrack>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Consultants availability */}
      <section className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="border-b border-zinc-200 px-4 py-3">
          <h2 className="font-semibold text-zinc-900">{t("consultantsRoadmap")}</h2>
          <p className="text-sm text-zinc-500">{t("consultantsRoadmapHint")}</p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="flex border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
              <div className="w-[200px] shrink-0 px-4 py-2">{t("colConsultant")}</div>
              <div className="w-[80px] shrink-0 px-2 py-2">{t("colLoad")}</div>
              <div className="w-[110px] shrink-0 px-2 py-2">{t("colFreeFrom")}</div>
              <div className="w-[120px] shrink-0 px-2 py-2">{t("colProjects")}</div>
              <TimelineHeader monthMarkers={monthMarkers} todayLeft={todayLeft} />
            </div>

            {sortedConsultants.length === 0 ? (
              <div className="px-4 py-8 text-sm text-zinc-500">{t("noConsultants")}</div>
            ) : (
              sortedConsultants.map(
                ({ consultant, freeDate, hours, segments }) => {
                  const overCapacity = hours > consultant.weeklyCapacityHours;
                  return (
                    <div
                      key={consultant.id}
                      className="flex border-b border-zinc-100 hover:bg-zinc-50/80"
                    >
                      <div className="flex w-[200px] shrink-0 items-center gap-2 px-4 py-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-700">
                          {initials(consultant.name)}
                        </span>
                        <span className="truncate text-sm font-medium text-zinc-900">
                          {consultant.name}
                        </span>
                      </div>

                      <div className="flex w-[80px] shrink-0 items-center px-2 py-2">
                        <span
                          className={`text-sm font-medium ${overCapacity ? "text-red-600" : "text-zinc-900"}`}
                        >
                          {hours}h
                        </span>
                        <span className="text-xs text-zinc-400">
                          /{consultant.weeklyCapacityHours}
                        </span>
                      </div>

                      <div className="flex w-[110px] shrink-0 items-center px-2 py-2">
                        {!freeDate ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-800">
                            {t("availableNow")}
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-zinc-900">
                            {formatDisplayDate(freeDate)}
                          </span>
                        )}
                      </div>

                      <div className="flex w-[120px] shrink-0 items-center px-2 py-2">
                        <span className="text-xs text-zinc-600">
                          {segments.length === 0
                            ? t("noAssignments")
                            : t("assignmentCount", { count: segments.length })}
                        </span>
                      </div>

                      <GanttTrack todayLeft={todayLeft}>
                        {segments.map((seg) => (
                          <GanttBar
                            key={seg.id}
                            barStart={seg.startDate}
                            barEnd={seg.endDate}
                            range={range}
                            colorClass={seg.colorClass}
                            label={seg.label}
                          />
                        ))}
                      </GanttTrack>
                    </div>
                  );
                },
              )
            )}
          </div>
        </div>
      </section>

      {/* Monthly capacity */}
      <section className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="border-b border-zinc-200 px-4 py-3">
          <h2 className="font-semibold text-zinc-900">{t("capacityMatrix")}</h2>
          <p className="text-sm text-zinc-500">{t("capacityMatrixHint")}</p>
        </div>

        <CapacityMatrix
          consultants={consultants}
          assignments={assignments}
          months={capacityMonths}
          embedded
        />
      </section>
    </div>
  );
}

function StatPill({
  label,
  value,
  highlight = false,
  alert = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        alert
          ? "border-amber-200 bg-amber-50"
          : highlight
            ? "border-blue-200 bg-blue-50"
            : "border-zinc-200 bg-white"
      }`}
    >
      <div className="text-lg font-semibold text-zinc-900">{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
