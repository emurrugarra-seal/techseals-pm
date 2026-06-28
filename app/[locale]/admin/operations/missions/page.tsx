"use client";

import { useCallback, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { AssignMatrix } from "@/components/assignments/AssignMatrix";
import { CapacityMatrix } from "@/components/assignments/CapacityMatrix";
import { db } from "@/lib/firebase/client";
import type { Assignment, Consultant, Project } from "@/lib/types";

type AssignmentTab = "assign" | "capacity";

export default function AssignmentsPage() {
  const t = useTranslations("assignments");
  const tCommon = useTranslations("common");
  const [tab, setTab] = useState<AssignmentTab>("assign");
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [consultantsSnap, projectsSnap, assignmentsSnap] = await Promise.all([
      getDocs(collection(db, "consultants")),
      getDocs(collection(db, "projects")),
      getDocs(collection(db, "assignments")),
    ]);

    setConsultants(
      consultantsSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Consultant, "id">) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setProjects(
      projectsSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Project, "id">) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setAssignments(
      assignmentsSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Assignment, "id">),
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">{t("title")}</h1>
      <p className="mt-1 text-sm text-zinc-600">{t("subtitle")}</p>

      <div className="mt-6 inline-flex rounded-lg border border-zinc-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setTab("assign")}
          className={`rounded-md px-4 py-2 text-sm ${
            tab === "assign"
              ? "bg-zinc-900 text-white"
              : "text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          {t("assignTab")}
        </button>
        <button
          type="button"
          onClick={() => setTab("capacity")}
          className={`rounded-md px-4 py-2 text-sm ${
            tab === "capacity"
              ? "bg-zinc-900 text-white"
              : "text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          {t("capacityTab")}
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-zinc-500">{tCommon("loading")}</p>
      ) : tab === "assign" ? (
        <AssignMatrix
          consultants={consultants}
          projects={projects}
          assignments={assignments}
          onRefresh={loadData}
        />
      ) : (
        <CapacityMatrix consultants={consultants} assignments={assignments} />
      )}
    </div>
  );
}
