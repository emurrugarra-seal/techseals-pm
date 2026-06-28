"use client";

import { FormEvent, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { db } from "@/lib/firebase/client";
import { formInputClass, formTextareaClass } from "@/lib/ui";

export default function NewClientPage() {
  const t = useTranslations("clients");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      await addDoc(collection(db, "clients"), {
        name,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        notes: notes || null,
        active: true,
        createdAt: now,
        updatedAt: now,
      });
      router.push("/admin/clients");
    } catch {
      setError(tCommon("saveError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-zinc-900">{t("createTitle")}</h1>

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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {submitting ? tCommon("saving") : tCommon("create")}
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
