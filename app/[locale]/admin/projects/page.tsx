"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/firebase/client";
import type { Client, Consultant, Project } from "@/lib/types";

export default function ProjectsPage() {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [projectsSnap, clientsSnap, consultantsSnap] = await Promise.all([
        getDocs(query(collection(db, "projects"), orderBy("startDate", "desc"))),
        getDocs(query(collection(db, "clients"), orderBy("name"))),
        getDocs(query(collection(db, "consultants"), orderBy("name"))),
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
      setLoading(false);
    }

    loadData();
  }, []);

  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c.name])),
    [clients],
  );

  const consultantMap = useMemo(
    () => new Map(consultants.map((c) => [c.id, c.name])),
    [consultants],
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-zinc-600">{t("subtitle")}</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {t("addProject")}
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">{tCommon("name")}</th>
              <th className="px-4 py-3 font-medium">{t("client")}</th>
              <th className="px-4 py-3 font-medium">{t("startDate")}</th>
              <th className="px-4 py-3 font-medium">{t("endDate")}</th>
              <th className="px-4 py-3 font-medium">{tCommon("status")}</th>
              <th className="px-4 py-3 font-medium">{t("priority")}</th>
              <th className="px-4 py-3 font-medium">{t("leadConsultant")}</th>
              <th className="px-4 py-3 font-medium">{tCommon("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-zinc-500">
                  {tCommon("loading")}
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-zinc-500">
                  {t("noProjects")}
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {project.name}
                  </td>
                  <td className="px-4 py-3">
                    {clientMap.get(project.clientId) ?? "—"}
                  </td>
                  <td className="px-4 py-3">{project.startDate}</td>
                  <td className="px-4 py-3">{project.endDate}</td>
                  <td className="px-4 py-3">
                    {t(`statuses.${project.status}`)}
                  </td>
                  <td className="px-4 py-3">
                    {t(`priorities.${project.priority}`)}
                  </td>
                  <td className="px-4 py-3">
                    {project.leadConsultantId
                      ? (consultantMap.get(project.leadConsultantId) ?? "—")
                      : t("none")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="text-zinc-700 underline hover:text-zinc-900"
                    >
                      {tCommon("edit")}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
