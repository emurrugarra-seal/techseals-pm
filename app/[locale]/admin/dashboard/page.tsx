import { getTranslations } from "next-intl/server";
import { RoadmapDashboard } from "@/components/dashboard/RoadmapDashboard";

export default async function AdminDashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <div>
      <p className="text-sm text-zinc-600">{t("subtitle")}</p>
      <RoadmapDashboard />
    </div>
  );
}
