"use client";

import { FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
} from "@/lib/constants";
import { formInputClass, formSelectClass, formTextareaClass } from "@/lib/ui";
import type { Client, Consultant, ProjectPriority, ProjectStatus } from "@/lib/types";

export interface ProjectFormValues {
  clientId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  actualEndDate: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  projectType: string;
  leadConsultantId: string;
  internalNotes: string;
}

interface ProjectFormProps {
  clients: Client[];
  consultants: Consultant[];
  values: ProjectFormValues;
  onChange: (values: ProjectFormValues) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
}

export function ProjectForm({
  clients,
  consultants,
  values,
  onChange,
  onSubmit,
  onCancel,
  submitting,
  error,
  submitLabel,
}: ProjectFormProps) {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");

  function setField<K extends keyof ProjectFormValues>(
    key: K,
    value: ProjectFormValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  const clientOptions = clients.filter(
    (c) => c.active || c.id === values.clientId,
  );

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 space-y-4 rounded-lg border border-zinc-200 bg-white p-6"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {t("client")} *
        </label>
        <select
          required
          value={values.clientId}
          onChange={(e) => setField("clientId", e.target.value)}
          className={formSelectClass}
        >
          <option value="" disabled>
            {t("none")}
          </option>
          {clientOptions.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {tCommon("name")} *
        </label>
        <input
          required
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          className={formInputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {t("description")}
        </label>
        <textarea
          rows={2}
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          className={formTextareaClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t("startDate")} *
          </label>
          <input
            type="date"
            required
            value={values.startDate}
            onChange={(e) => setField("startDate", e.target.value)}
            className={formInputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t("endDate")} *
          </label>
          <input
            type="date"
            required
            value={values.endDate}
            onChange={(e) => setField("endDate", e.target.value)}
            className={formInputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {tCommon("status")} *
          </label>
          <select
            value={values.status}
            onChange={(e) =>
              setField("status", e.target.value as ProjectStatus)
            }
            className={formSelectClass}
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`statuses.${status}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t("priority")} *
          </label>
          <select
            value={values.priority}
            onChange={(e) =>
              setField("priority", e.target.value as ProjectPriority)
            }
            className={formSelectClass}
          >
            {PROJECT_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {t(`priorities.${priority}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t("projectType")}
          </label>
          <select
            value={values.projectType}
            onChange={(e) => setField("projectType", e.target.value)}
            className={formSelectClass}
          >
            <option value="">{t("none")}</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`types.${type}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t("leadConsultant")}
          </label>
          <select
            value={values.leadConsultantId}
            onChange={(e) => setField("leadConsultantId", e.target.value)}
            className={formSelectClass}
          >
            <option value="">{t("none")}</option>
            {consultants
              .filter((c) => c.active)
              .map((consultant) => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {t("actualEndDate")}
        </label>
        <input
          type="date"
          value={values.actualEndDate}
          onChange={(e) => setField("actualEndDate", e.target.value)}
          className={formInputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {t("internalNotes")}
        </label>
        <textarea
          rows={3}
          value={values.internalNotes}
          onChange={(e) => setField("internalNotes", e.target.value)}
          className={formTextareaClass}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {submitting ? tCommon("saving") : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700"
        >
          {tCommon("cancel")}
        </button>
      </div>
    </form>
  );
}

export function emptyProjectFormValues(): ProjectFormValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    clientId: "",
    name: "",
    description: "",
    startDate: today,
    endDate: today,
    actualEndDate: "",
    status: "planned",
    priority: "medium",
    projectType: "",
    leadConsultantId: "",
    internalNotes: "",
  };
}

export function projectToFormValues(project: {
  clientId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  actualEndDate?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  projectType?: string;
  leadConsultantId?: string;
  internalNotes?: string;
}): ProjectFormValues {
  return {
    clientId: project.clientId,
    name: project.name,
    description: project.description ?? "",
    startDate: project.startDate,
    endDate: project.endDate,
    actualEndDate: project.actualEndDate ?? "",
    status: project.status,
    priority: project.priority,
    projectType: project.projectType ?? "",
    leadConsultantId: project.leadConsultantId ?? "",
    internalNotes: project.internalNotes ?? "",
  };
}

export function formValuesToFirestore(values: ProjectFormValues) {
  return {
    clientId: values.clientId,
    name: values.name,
    description: values.description || null,
    startDate: values.startDate,
    endDate: values.endDate,
    actualEndDate: values.actualEndDate || null,
    status: values.status,
    priority: values.priority,
    projectType: values.projectType || null,
    leadConsultantId: values.leadConsultantId || null,
    internalNotes: values.internalNotes || null,
  };
}
