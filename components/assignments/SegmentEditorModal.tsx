"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useTranslations } from "next-intl";
import { db } from "@/lib/firebase/client";
import { newSegmentId } from "@/lib/assignments/capacity";
import { formInputClass, formSelectClass } from "@/lib/ui";
import type { Assignment, AssignmentSegment, Consultant, Project } from "@/lib/types";

type AllocationMode = "hoursPerWeek" | "totalHours";

interface SegmentEditorModalProps {
  consultant: Consultant;
  project: Project;
  assignment: Assignment | undefined;
  onClose: () => void;
  onSaved: () => void;
}

function emptySegment(): AssignmentSegment {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: newSegmentId(),
    startDate: today,
    endDate: today,
    hoursPerWeek: 40,
  };
}

export function SegmentEditorModal({
  consultant,
  project,
  assignment,
  onClose,
  onSaved,
}: SegmentEditorModalProps) {
  const t = useTranslations("assignments");
  const tCommon = useTranslations("common");

  const [segments, setSegments] = useState<AssignmentSegment[]>([]);
  const [modes, setModes] = useState<Record<string, AllocationMode>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initial = assignment?.segments ?? [];
    setSegments(initial.length > 0 ? initial : [emptySegment()]);
    setModes(
      Object.fromEntries(
        initial.map((s) => [
          s.id,
          s.totalHours != null && s.totalHours > 0 ? "totalHours" : "hoursPerWeek",
        ]),
      ),
    );
  }, [assignment]);

  function updateSegment(id: string, patch: Partial<AssignmentSegment>) {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  }

  function setMode(id: string, mode: AllocationMode) {
    setModes((prev) => ({ ...prev, [id]: mode }));
    if (mode === "hoursPerWeek") {
      updateSegment(id, { totalHours: undefined, hoursPerWeek: 40 });
    } else {
      updateSegment(id, { hoursPerWeek: undefined, totalHours: 16 });
    }
  }

  function addSegment() {
    const segment = emptySegment();
    setSegments((prev) => [...prev, segment]);
    setModes((prev) => ({ ...prev, [segment.id]: "hoursPerWeek" }));
  }

  function removeSegment(id: string) {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const cleaned = segments
      .map((s) => {
        const mode = modes[s.id] ?? "hoursPerWeek";
        return {
          id: s.id,
          startDate: s.startDate,
          endDate: s.endDate,
          ...(mode === "totalHours"
            ? { totalHours: s.totalHours ?? 0 }
            : { hoursPerWeek: s.hoursPerWeek ?? 0 }),
        };
      })
      .filter((s) => s.startDate && s.endDate && s.startDate <= s.endDate);

    try {
      const now = new Date().toISOString();

      if (cleaned.length === 0) {
        if (assignment) {
          await deleteDoc(doc(db, "assignments", assignment.id));
        }
      } else if (assignment) {
        await updateDoc(doc(db, "assignments", assignment.id), {
          segments: cleaned,
          updatedAt: now,
        });
      } else {
        await addDoc(collection(db, "assignments"), {
          consultantId: consultant.id,
          projectId: project.id,
          segments: cleaned,
          createdAt: now,
          updatedAt: now,
        });
      }

      onSaved();
      onClose();
    } catch {
      setError(tCommon("saveError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-zinc-900">{t("editAssignment")}</h2>
        <p className="mt-1 text-sm text-zinc-600">
          {consultant.name} → {project.name}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {segments.map((segment, index) => {
            const mode = modes[segment.id] ?? "hoursPerWeek";
            return (
              <div
                key={segment.id}
                className="rounded-lg border border-zinc-200 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700">
                    {t("segment")} {index + 1}
                  </span>
                  {segments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSegment(segment.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      {tCommon("delete")}
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-zinc-600">
                      {t("segmentStart")}
                    </label>
                    <input
                      type="date"
                      required
                      value={segment.startDate}
                      onChange={(e) =>
                        updateSegment(segment.id, { startDate: e.target.value })
                      }
                      className={formInputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-600">
                      {t("segmentEnd")}
                    </label>
                    <input
                      type="date"
                      required
                      value={segment.endDate}
                      onChange={(e) =>
                        updateSegment(segment.id, { endDate: e.target.value })
                      }
                      className={formInputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-zinc-600">
                    {t("allocationType")}
                  </label>
                  <select
                    value={mode}
                    onChange={(e) =>
                      setMode(segment.id, e.target.value as AllocationMode)
                    }
                    className={formSelectClass}
                  >
                    <option value="hoursPerWeek">{t("hoursPerWeek")}</option>
                    <option value="totalHours">{t("totalHours")}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-zinc-600">
                    {mode === "totalHours" ? t("totalHours") : t("hoursPerWeek")}
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    required
                    value={
                      mode === "totalHours"
                        ? (segment.totalHours ?? "")
                        : (segment.hoursPerWeek ?? "")
                    }
                    onChange={(e) =>
                      updateSegment(
                        segment.id,
                        mode === "totalHours"
                          ? { totalHours: Number(e.target.value) }
                          : { hoursPerWeek: Number(e.target.value) },
                      )
                    }
                    className={formInputClass}
                  />
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addSegment}
            className="text-sm text-zinc-700 underline hover:text-zinc-900"
          >
            {t("addSegment")}
          </button>

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
              onClick={onClose}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700"
            >
              {tCommon("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
