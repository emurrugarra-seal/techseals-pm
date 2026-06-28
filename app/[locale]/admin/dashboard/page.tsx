import { getTranslations } from "next-intl/server";
import { RoadmapDashboard } from "@/components/dashboard/RoadmapDashboard";

export default async function AdminDashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">{t("title")}</h1>
      <p className="mt-1 text-sm text-zinc-600">{t("subtitle")}</p>
      <RoadmapDashboard />
    </div>
  );
}
