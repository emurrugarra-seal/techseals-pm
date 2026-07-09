"use client";

import { FormEvent, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PasswordInput } from "@/components/PasswordInput";
import { JOB_ROLES, SENIORITIES } from "@/lib/constants";
import { db } from "@/lib/firebase/client";
import { formInputClass, formSelectClass } from "@/lib/ui";
import type { Consultant, JobRole, Seniority } from "@/lib/types";

export default function EditConsultantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("consultants");
  const tCommon = useTranslations("common");
  const { getIdToken } = useAuth();
  const router = useRouter();

  const [consultantId, setConsultantId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [jobRole, setJobRole] = useState<JobRole>("consultant");
  const [seniority, setSeniority] = useState<Seniority>("medior");
  const [weeklyCapacityHours, setWeeklyCapacityHours] = useState(40);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadConsultant() {
      const { id } = await params;
      setConsultantId(id);

      const snap = await getDoc(doc(db, "consultants", id));
      if (!snap.exists()) {
        router.replace("/admin/operations/consultants");
        return;
      }

      const data = snap.data() as Omit<Consultant, "id">;
      setName(data.name);
      setEmail(data.email);
      setJobRole(data.jobRole);
      setSeniority(data.seniority);
      setWeeklyCapacityHours(data.weeklyCapacityHours);
      setActive(data.active);
      setLoading(false);
    }

    loadConsultant();
  }, [params, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!consultantId) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`/api/admin/consultants/${consultantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          ...(password ? { password } : {}),
          jobRole,
          seniority,
          weeklyCapacityHours,
          active,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? t("updateError"));
      }

      router.push("/admin/operations/consultants");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : t("updateError"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">{tCommon("loading")}</p>;
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-zinc-900">{t("editTitle")}</h1>
      <p className="mt-1 text-sm text-zinc-600">{t("editSubtitle")}</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-lg border border-zinc-200 bg-white p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {tCommon("name")}
          </label>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={formInputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {tCommon("email")}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={formInputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t("newPassword")}
          </label>
          <PasswordInput
            minLength={6}
            value={password}
            onChange={setPassword}
          />
          <p className="mt-1 text-xs text-zinc-500">{t("passwordHint")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              {t("jobRole")}
            </label>
            <select
              value={jobRole}
              onChange={(event) => setJobRole(event.target.value as JobRole)}
              className={formSelectClass}
            >
              {JOB_ROLES.map((role) => (
                <option key={role} value={role}>
                  {t(`roles.${role}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              {t("seniority")}
            </label>
            <select
              value={seniority}
              onChange={(event) =>
                setSeniority(event.target.value as Seniority)
              }
              className={formSelectClass}
            >
              {SENIORITIES.map((level) => (
                <option key={level} value={level}>
                  {t(`seniorities.${level}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t("weeklyCapacity")}
          </label>
          <input
            type="number"
            min={1}
            max={80}
            required
            value={weeklyCapacityHours}
            onChange={(event) =>
              setWeeklyCapacityHours(Number(event.target.value))
            }
            className={formInputClass}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="h-4 w-4 rounded border-zinc-300"
          />
          <label htmlFor="active" className="text-sm text-zinc-700">
            {tCommon("active")}
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {submitting ? tCommon("saving") : tCommon("save")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/operations/consultants")}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700"
          >
            {tCommon("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
