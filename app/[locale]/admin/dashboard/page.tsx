import { getTranslations } from "next-intl/server";

export default async function AdminDashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">{t("title")}</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="font-medium text-zinc-900">{t("endingSoon")}</h2>
          <p className="mt-2 text-sm text-zinc-500">{t("noEndingSoon")}</p>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="font-medium text-zinc-900">{t("overCapacity")}</h2>
          <p className="mt-2 text-sm text-zinc-500">{t("noOverCapacity")}</p>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="font-medium text-zinc-900">{t("unassignedProjects")}</h2>
          <p className="mt-2 text-sm text-zinc-500">{t("noUnassigned")}</p>
        </section>
      </div>
    </div>
  );
}
