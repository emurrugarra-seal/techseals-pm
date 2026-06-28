"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  ProjectForm,
  formValuesToFirestore,
  projectToFormValues,
  type ProjectFormValues,
} from "@/components/ProjectForm";
import { db } from "@/lib/firebase/client";
import type { Client, Consultant, Project } from "@/lib/types";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [values, setValues] = useState<ProjectFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { id } = await params;
      setProjectId(id);

      const [projectSnap, clientsSnap, consultantsSnap] = await Promise.all([
        getDoc(doc(db, "projects", id)),
        getDocs(query(collection(db, "clients"), orderBy("name"))),
        getDocs(query(collection(db, "consultants"), orderBy("name"))),
      ]);

      if (!projectSnap.exists()) {
        router.replace("/admin/projects");
        return;
      }

      const project = {
        id: projectSnap.id,
        ...(projectSnap.data() as Omit<Project, "id">),
      };

      setValues(projectToFormValues(project));
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
  }, [params, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!projectId || !values) return;

    setSubmitting(true);
    setError(null);

    try {
      await updateDoc(doc(db, "projects", projectId), {
        ...formValuesToFirestore(values),
        updatedAt: new Date().toISOString(),
      });
      router.push("/admin/projects");
    } catch {
      setError(tCommon("saveError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !values) {
    return <p className="text-sm text-zinc-500">{tCommon("loading")}</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">{t("editTitle")}</h1>

      <ProjectForm
        clients={clients}
        consultants={consultants}
        values={values}
        onChange={setValues}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/projects")}
        submitting={submitting}
        error={error}
        submitLabel={tCommon("save")}
      />
    </div>
  );
}
