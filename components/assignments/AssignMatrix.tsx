"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  assignmentDisplayWeeklyHours,
  assignmentHasMission,
  findAssignment,
  todayIso,
} from "@/lib/assignments/capacity";
import { SegmentEditorModal } from "@/components/assignments/SegmentEditorModal";
import type { Assignment, Consultant, Project } from "@/lib/types";

interface AssignMatrixProps {
  consultants: Consultant[];
  projects: Project[];
  assignments: Assignment[];
  onRefresh: () => void;
}

export function AssignMatrix({
  consultants,
  projects,
  assignments,
  onRefresh,
}: AssignMatrixProps) {
  const t = useTranslations("assignments");

  const [selected, setSelected] = useState<{
    consultant: Consultant;
    project: Project;
  } | null>(null);

  const today = todayIso();

  const activeConsultants = useMemo(
    () => consultants.filter((c) => c.active),
    [consultants],
  );

  const matrixProjects = useMemo(
    () =>
      projects.filter((p) => p.status === "active" || p.status === "planned"),
    [projects],
  );

  function cellHours(consultantId: string, projectId: string): number {
    const assignment = findAssignment(assignments, consultantId, projectId);
    if (!assignment) return 0;
    return assignmentDisplayWeeklyHours(assignment, today);
  }

  function cellHasUpcomingOnly(
    consultantId: string,
    projectId: string,
  ): boolean {
    const assignment = findAssignment(assignments, consultantId, projectId);
    if (!assignment || !assignmentHasMission(assignment, today)) return false;
    return assignmentDisplayWeeklyHours(assignment, today) > 0 &&
      !assignment.segments.some(
        (s) => s.startDate <= today && s.endDate >= today,
      );
  }

  if (activeConsultants.length === 0 || matrixProjects.length === 0) {
    return (
      <p className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
        {t("matrixEmpty")}
      </p>
    );
  }

  return (
    <>
      <p className="mt-4 text-sm text-zinc-600">{t("assignHint")}</p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="sticky left-0 z-10 bg-zinc-50 px-4 py-3 font-medium w-[60px]">
                #
              </th>
              <th className="sticky left-[60px] z-10 bg-zinc-50 px-4 py-3 font-medium min-w-[160px]">
                {t("consultant")}
              </th>
              {matrixProjects.map((project) => (
                <th
                  key={project.id}
                  className="px-3 py-3 font-medium min-w-[100px] max-w-[140px]"
                  title={project.name}
                >
                  <span className="line-clamp-2">{project.name}</span>
                </th>
              ))}
              <th className="px-4 py-3 font-medium bg-zinc-100">{t("total")}</th>
            </tr>
          </thead>
          <tbody>
            {activeConsultants.map((consultant, index) => {
              const rowTotal = matrixProjects.reduce(
                (sum, project) => sum + cellHours(consultant.id, project.id),
                0,
              );
              const overCapacity = rowTotal > consultant.weeklyCapacityHours;

              return (
                <tr key={consultant.id} className="border-t border-zinc-100">
                  <td className="sticky left-0 z-10 bg-white px-4 py-2 text-zinc-500">
                    {index + 1}
                  </td>
                  <td className="sticky left-[60px] z-10 bg-white px-4 py-2 font-medium text-zinc-900">
                    <div>{consultant.name}</div>
                    <div className="text-xs font-normal text-zinc-500">
                      {consultant.weeklyCapacityHours}h/{t("weekShort")}
                    </div>
                  </td>
                  {matrixProjects.map((project) => {
                    const hours = cellHours(consultant.id, project.id);
                    const upcomingOnly = cellHasUpcomingOnly(
                      consultant.id,
                      project.id,
                    );
                    return (
                      <td key={project.id} className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setSelected({ consultant, project })
                          }
                          className={`w-full rounded-md border px-2 py-2 text-sm transition-colors hover:border-zinc-400 ${
                            hours > 0
                              ? upcomingOnly
                                ? "border-blue-200 bg-blue-50 text-blue-900"
                                : "border-zinc-300 bg-zinc-50 text-zinc-900"
                              : "border-dashed border-zinc-200 text-zinc-400"
                          }`}
                          title={
                            upcomingOnly ? t("upcomingMission") : undefined
                          }
                        >
                          {hours > 0 ? `${hours}h` : "—"}
                        </button>
                      </td>
                    );
                  })}
                  <td
                    className={`px-4 py-2 text-center font-medium ${
                      overCapacity ? "text-red-600" : "text-zinc-900"
                    }`}
                  >
                    {rowTotal}h
                    {overCapacity && " ⚠️"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-zinc-500">{t("assignFootnote")}</p>

      {selected && (
        <SegmentEditorModal
          consultant={selected.consultant}
          project={selected.project}
          assignment={findAssignment(
            assignments,
            selected.consultant.id,
            selected.project.id,
          )}
          onClose={() => setSelected(null)}
          onSaved={onRefresh}
        />
      )}
    </>
  );
}
