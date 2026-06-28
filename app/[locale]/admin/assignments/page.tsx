"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type AssignmentTab = "assign" | "capacity";

export default function AssignmentsPage() {
  const t = useTranslations("assignments");
  const [tab, setTab] = useState<AssignmentTab>("assign");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">{t("title")}</h1>
      <p className="mt-1 text-sm text-zinc-600">{t("subtitle")}</p>

      <div className="mt-6 inline-flex rounded-lg border border-zinc-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setTab("assign")}
          className={`rounded-md px-4 py-2 text-sm ${
            tab === "assign"
              ? "bg-zinc-900 text-white"
              : "text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          {t("assignTab")}
        </button>
        <button
          type="button"
          onClick={() => setTab("capacity")}
          className={`rounded-md px-4 py-2 text-sm ${
            tab === "capacity"
              ? "bg-zinc-900 text-white"
              : "text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          {t("capacityTab")}
        </button>
      </div>

      <p className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
        {t("comingSoon")} ({tab === "assign" ? t("assignTab") : t("capacityTab")})
      </p>
    </div>
  );
}
