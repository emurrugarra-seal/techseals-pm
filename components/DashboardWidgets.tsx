"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  addDays,
  consultantWeeklyHoursInRange,
  todayIso,
} from "@/lib/assignments/capacity";
import { db } from "@/lib/firebase/client";
import type { Assignment, Client, Consultant, Project } from "@/lib/types";

export function DashboardWidgets() {
  const t = useTranslations("dashboard");
  const tProjects = useTranslations("projects");
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

  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c.name])),
    [clients],
  );

  const today = todayIso();
  const in90Days = addDays(today, 90);

  const endingSoon = useMemo(
    () =>
      projects
        .filter(
          (p) =>
            (p.status === "active" || p.status === "planned") &&
            p.endDate >= today &&
            p.endDate <= in90Days,
        )
        .sort((a, b) => a.endDate.localeCompare(b.endDate)),
    [projects, today, in90Days],
  );

  const assignedProjectIds = useMemo(
    () => new Set(assignments.map((a) => a.projectId)),
    [assignments],
  );

  const unassignedProjects = useMemo(
    () =>
      projects.filter(
        (p) => p.status === "active" && !assignedProjectIds.has(p.id),
      ),
    [projects, assignedProjectIds],
  );

  const overCapacityConsultants = useMemo(
    () =>
      consultants
        .filter((c) => c.active)
        .map((c) => ({
          consultant: c,
          hours: consultantWeeklyHoursInRange(
            assignments,
            c.id,
            today,
            today,
          ),
        }))
        .filter(({ consultant, hours }) => hours > consultant.weeklyCapacityHours)
        .sort((a, b) => b.hours - a.hours),
    [consultants, assignments, today],
  );

  if (loading) {
    return <p className="mt-6 text-sm text-zinc-500">{t("loading")}</p>;
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="font-medium text-zinc-900">{t("endingSoon")}</h2>
        {endingSoon.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">{t("noEndingSoon")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {endingSoon.map((project) => (
              <li key={project.id} className="text-sm">
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="font-medium text-zinc-900 hover:underline"
                >
                  {project.name}
                </Link>
                <div className="text-zinc-500">
                  {clientMap.get(project.clientId) ?? "—"} · {project.endDate}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="font-medium text-zinc-900">{t("overCapacity")}</h2>
        {overCapacityConsultants.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">{t("noOverCapacity")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {overCapacityConsultants.map(({ consultant, hours }) => (
              <li key={consultant.id} className="text-sm">
                <span className="font-medium text-red-700">{consultant.name}</span>
                <div className="text-zinc-500">
                  {hours}h / {consultant.weeklyCapacityHours}h {t("thisWeek")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="font-medium text-zinc-900">{t("unassignedProjects")}</h2>
        {unassignedProjects.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">{t("noUnassigned")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {unassignedProjects.map((project) => (
              <li key={project.id} className="text-sm">
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="font-medium text-zinc-900 hover:underline"
                >
                  {project.name}
                </Link>
                <div className="text-zinc-500">
                  {tProjects(`statuses.${project.status}`)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
