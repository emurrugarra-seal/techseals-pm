"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PasswordInput } from "@/components/PasswordInput";
import { JOB_ROLES, SENIORITIES, DEFAULT_WEEKLY_CAPACITY } from "@/lib/constants";
import { formInputClass, formSelectClass } from "@/lib/ui";
import type { JobRole, Seniority } from "@/lib/types";

export default function NewConsultantPage() {
  const t = useTranslations("consultants");
  const tCommon = useTranslations("common");
  const { getIdToken } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [jobRole, setJobRole] = useState<JobRole>("consultant");
  const [seniority, setSeniority] = useState<Seniority>("medior");
  const [weeklyCapacityHours, setWeeklyCapacityHours] = useState(
    DEFAULT_WEEKLY_CAPACITY,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/admin/consultants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          jobRole,
          seniority,
          weeklyCapacityHours,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? t("createError"));
      }

      router.push("/admin/operations/consultants");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : t("createError"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-zinc-900">{t("createTitle")}</h1>
      <p className="mt-1 text-sm text-zinc-600">{t("createSubtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
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
            {tCommon("password")}
          </label>
          <PasswordInput
            required
            minLength={6}
            value={password}
            onChange={setPassword}
          />
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {submitting ? t("creating") : tCommon("create")}
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
