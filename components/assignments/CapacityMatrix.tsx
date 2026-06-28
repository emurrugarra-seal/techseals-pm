"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  capacityColorClass,
  consultantWeeklyHoursInRange,
  getMonthRange,
  getUpcomingMonths,
} from "@/lib/assignments/capacity";
import type { Assignment, Consultant } from "@/lib/types";

interface CapacityMatrixProps {
  consultants: Consultant[];
  assignments: Assignment[];
}

export function CapacityMatrix({
  consultants,
  assignments,
}: CapacityMatrixProps) {
  const t = useTranslations("assignments");

  const months = useMemo(() => getUpcomingMonths(6), []);

  const activeConsultants = useMemo(
    () => consultants.filter((c) => c.active),
    [consultants],
  );

  if (activeConsultants.length === 0) {
    return (
      <p className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
        {t("capacityEmpty")}
      </p>
    );
  }

  return (
    <>
      <p className="mt-4 text-sm text-zinc-600">{t("capacityHint")}</p>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-green-50 border border-green-200" />
          {t("underCapacity")}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-amber-100 border border-amber-200" />
          {t("nearCapacity")}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-red-100 border border-red-200" />
          {t("overCapacity")}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="sticky left-0 z-10 bg-zinc-50 px-4 py-3 font-medium min-w-[160px]">
                {t("consultant")}
              </th>
              {months.map((m) => (
                <th key={`${m.year}-${m.month}`} className="px-3 py-3 font-medium">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeConsultants.map((consultant) => (
              <tr key={consultant.id} className="border-t border-zinc-100">
                <td className="sticky left-0 z-10 bg-white px-4 py-2 font-medium text-zinc-900">
                  <div>{consultant.name}</div>
                  <div className="text-xs font-normal text-zinc-500">
                    {consultant.weeklyCapacityHours}h/{t("weekShort")}
                  </div>
                </td>
                {months.map((m) => {
                  const range = getMonthRange(m.year, m.month);
                  const hours = consultantWeeklyHoursInRange(
                    assignments,
                    consultant.id,
                    range.start,
                    range.end,
                  );
                  return (
                    <td key={`${m.year}-${m.month}`} className="px-2 py-2 text-center">
                      <div
                        className={`rounded-md px-2 py-2 text-sm ${capacityColorClass(
                          hours,
                          consultant.weeklyCapacityHours,
                        )}`}
                      >
                        {hours > 0 ? `${Math.round(hours * 10) / 10}h` : "—"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-zinc-500">{t("capacityFootnote")}</p>
    </>
  );
}
