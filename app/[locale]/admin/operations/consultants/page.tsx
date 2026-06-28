"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/firebase/client";
import type { Consultant } from "@/lib/types";

export default function ConsultantsPage() {
  const t = useTranslations("consultants");
  const tCommon = useTranslations("common");
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConsultants() {
      const snap = await getDocs(
        query(collection(db, "consultants"), orderBy("name")),
      );
      setConsultants(
        snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Consultant, "id">),
        })),
      );
      setLoading(false);
    }

    loadConsultants();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-zinc-600">{t("subtitle")}</p>
        </div>
        <Link
          href="/admin/operations/consultants/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {t("addConsultant")}
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">{tCommon("name")}</th>
              <th className="px-4 py-3 font-medium">{tCommon("email")}</th>
              <th className="px-4 py-3 font-medium">{t("jobRole")}</th>
              <th className="px-4 py-3 font-medium">{t("seniority")}</th>
              <th className="px-4 py-3 font-medium">{t("weeklyCapacity")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-zinc-500">
                  {tCommon("loading")}
                </td>
              </tr>
            ) : consultants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-zinc-500">
                  {t("noConsultants")}
                </td>
              </tr>
            ) : (
              consultants.map((consultant) => (
                <tr key={consultant.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3">{consultant.name}</td>
                  <td className="px-4 py-3">{consultant.email}</td>
                  <td className="px-4 py-3">
                    {t(`roles.${consultant.jobRole}`)}
                  </td>
                  <td className="px-4 py-3">
                    {t(`seniorities.${consultant.seniority}`)}
                  </td>
                  <td className="px-4 py-3">{consultant.weeklyCapacityHours}h</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
