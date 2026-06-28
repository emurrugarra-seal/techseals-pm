"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formatDisplayDate } from "@/lib/assignments/capacity";
import { db } from "@/lib/firebase/client";
import type { Assignment, Client, Project } from "@/lib/types";

interface ConsultantProjectView {
  project: Project;
  clientName: string;
  currentHours: number;
  periodLabel: string;
}

function isActiveSegment(startDate: string, endDate: string) {
  const today = new Date().toISOString().slice(0, 10);
  return startDate <= today && endDate >= today;
}

function ConsultantProjectsContent() {
  const t = useTranslations("consultantPortal");
  const tCommon = useTranslations("common");
  const { profile, signOutUser } = useAuth();
  const [items, setItems] = useState<ConsultantProjectView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      if (!profile?.consultantId) {
        setLoading(false);
        return;
      }

      const assignmentsSnap = await getDocs(
        query(
          collection(db, "assignments"),
          where("consultantId", "==", profile.consultantId),
        ),
      );

      const views: ConsultantProjectView[] = [];

      for (const assignmentDoc of assignmentsSnap.docs) {
        const assignment = {
          id: assignmentDoc.id,
          ...(assignmentDoc.data() as Omit<Assignment, "id">),
        };

        const activeSegment = assignment.segments.find((segment) =>
          isActiveSegment(segment.startDate, segment.endDate),
        );

        if (!activeSegment) continue;

        const projectSnap = await getDoc(doc(db, "projects", assignment.projectId));
        if (!projectSnap.exists()) continue;

        const project = {
          id: projectSnap.id,
          ...(projectSnap.data() as Omit<Project, "id">),
        };

        const clientSnap = await getDoc(doc(db, "clients", project.clientId));
        const clientName = clientSnap.exists()
          ? (clientSnap.data() as Client).name
          : "—";

        views.push({
          project,
          clientName,
          currentHours:
            activeSegment.hoursPerWeek ?? activeSegment.totalHours ?? 0,
          periodLabel: `${formatDisplayDate(activeSegment.startDate)} → ${formatDisplayDate(activeSegment.endDate)}`,
        });
      }

      setItems(views);
      setLoading(false);
    }

    loadProjects();
  }, [profile?.consultantId]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="font-semibold text-zinc-900">{tCommon("appName")}</div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => signOutUser()}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700"
            >
              {tCommon("signOut")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-zinc-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-zinc-600">{t("subtitle")}</p>

        {loading ? (
          <p className="mt-6 text-sm text-zinc-500">{tCommon("loading")}</p>
        ) : items.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
            {t("noProjects")}
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {items.map(({ project, clientName, currentHours, periodLabel }) => (
              <article
                key={project.id}
                className="rounded-lg border border-zinc-200 bg-white p-5"
              >
                <h2 className="text-lg font-medium text-zinc-900">{project.name}</h2>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-zinc-500">{t("client")}</dt>
                    <dd className="text-zinc-900">{clientName}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">{t("status")}</dt>
                    <dd className="capitalize text-zinc-900">{project.status}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">{t("hoursPerWeek")}</dt>
                    <dd className="text-zinc-900">{currentHours}h</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">{t("period")}</dt>
                    <dd className="text-zinc-900">{periodLabel}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ConsultantProjectsPage() {
  return (
    <RequireAuth role="consultant">
      <ConsultantProjectsContent />
    </RequireAuth>
  );
}
