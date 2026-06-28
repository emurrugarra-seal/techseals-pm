"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/firebase/client";
import type { Client } from "@/lib/types";

export default function ClientsPage() {
  const t = useTranslations("clients");
  const tCommon = useTranslations("common");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      const snap = await getDocs(
        query(collection(db, "clients"), orderBy("name")),
      );
      setClients(
        snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Client, "id">),
        })),
      );
      setLoading(false);
    }

    loadClients();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-zinc-600">{t("subtitle")}</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {t("addClient")}
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">{tCommon("name")}</th>
              <th className="px-4 py-3 font-medium">{t("contactEmail")}</th>
              <th className="px-4 py-3 font-medium">{t("contactPhone")}</th>
              <th className="px-4 py-3 font-medium">{tCommon("status")}</th>
              <th className="px-4 py-3 font-medium">{tCommon("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-zinc-500">
                  {tCommon("loading")}
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-zinc-500">
                  {t("noClients")}
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {client.name}
                  </td>
                  <td className="px-4 py-3">{client.contactEmail ?? "—"}</td>
                  <td className="px-4 py-3">{client.contactPhone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        client.active
                          ? "bg-green-100 text-green-800"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {client.active ? tCommon("active") : tCommon("inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/clients/${client.id}/edit`}
                      className="text-zinc-700 underline hover:text-zinc-900"
                    >
                      {tCommon("edit")}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
