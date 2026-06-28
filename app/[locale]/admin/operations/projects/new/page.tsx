"use client";

import { FormEvent, useEffect, useState } from "react";
import { addDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  ProjectForm,
  emptyProjectFormValues,
  formValuesToFirestore,
  type ProjectFormValues,
} from "@/components/ProjectForm";
import { db } from "@/lib/firebase/client";
import type { Client, Consultant } from "@/lib/types";

export default function NewProjectPage() {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [values, setValues] = useState<ProjectFormValues>(emptyProjectFormValues);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      const [clientsSnap, consultantsSnap] = await Promise.all([
        getDocs(query(collection(db, "clients"), orderBy("name"))),
        getDocs(query(collection(db, "consultants"), orderBy("name"))),
      ]);

      const loadedClients = clientsSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Client, "id">),
      }));

      setClients(loadedClients);
      setConsultants(
        consultantsSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Consultant, "id">),
        })),
      );

      const firstActive = loadedClients.find((c) => c.active);
      if (firstActive) {
        setValues((prev) => ({ ...prev, clientId: firstActive.id }));
      }

      setLoading(false);
    }

    loadOptions();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      await addDoc(collection(db, "projects"), {
        ...formValuesToFirestore(values),
        createdAt: now,
        updatedAt: now,
      });
      router.push("/admin/operations/projects");
    } catch {
      setError(tCommon("saveError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">{tCommon("loading")}</p>;
  }

  const hasActiveClients = clients.some((c) => c.active);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">{t("createTitle")}</h1>

      {!hasActiveClients ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {t("noClientsHint")}
        </p>
      ) : (
        <ProjectForm
          clients={clients}
          consultants={consultants}
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/operations/projects")}
          submitting={submitting}
          error={error}
          submitLabel={tCommon("create")}
        />
      )}
    </div>
  );
}
