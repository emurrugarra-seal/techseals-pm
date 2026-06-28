import { getTranslations } from "next-intl/server";
import { DashboardWidgets } from "@/components/DashboardWidgets";

export default async function AdminDashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">{t("title")}</h1>
      <DashboardWidgets />
    </div>
  );
}
