"use client";

import { FormEvent, useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { db } from "@/lib/firebase/client";
import { formInputClass, formTextareaClass } from "@/lib/ui";
import type { Client } from "@/lib/types";

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("clients");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [clientId, setClientId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadClient() {
      const { id } = await params;
      setClientId(id);

      const snap = await getDoc(doc(db, "clients", id));
      if (!snap.exists()) {
        router.replace("/admin/clients");
        return;
      }

      const data = snap.data() as Omit<Client, "id">;
      setName(data.name);
      setContactEmail(data.contactEmail ?? "");
      setContactPhone(data.contactPhone ?? "");
      setNotes(data.notes ?? "");
      setActive(data.active);
      setLoading(false);
    }

    loadClient();
  }, [params, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!clientId) return;

    setSubmitting(true);
    setError(null);

    try {
      await updateDoc(doc(db, "clients", clientId), {
        name,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        notes: notes || null,
        active,
        updatedAt: new Date().toISOString(),
      });
      router.push("/admin/clients");
    } catch {
      setError(tCommon("saveError"));
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

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-lg border border-zinc-200 bg-white p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {tCommon("name")} *
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={formInputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t("contactEmail")}
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className={formInputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t("contactPhone")}
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className={formInputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {tCommon("notes")}
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={formTextareaClass}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
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
            onClick={() => router.push("/admin/clients")}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700"
          >
            {tCommon("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
