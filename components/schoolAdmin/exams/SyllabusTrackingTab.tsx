"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { SyllabusItem } from "@/hooks/useExamTerms";
import {
  EXAM_ACCENT,
  EXAM_TEXT_MAIN,
  EXAM_TEXT_SECONDARY,
  EXAM_GRADIENT_FULL,
  EXAM_PROGRESS_GREEN,
  EXAM_PROGRESS_YELLOW,
  EXAM_PROGRESS_EMPTY,
  EXAM_CARD_TRANSPARENT,
  EXAM_INPUT_BG,
} from "@/app/frontend/constants/colors";

function getProgressBarColor(percent: number) {
  if (percent >= 100) return EXAM_PROGRESS_GREEN;
  if (percent > 0) return EXAM_PROGRESS_YELLOW;
  return EXAM_PROGRESS_EMPTY;
}

interface SyllabusTrackingTabProps {
  termId: string;
  syllabus: SyllabusItem[];
  onSyllabusChange: () => void;
}

export default function SyllabusTrackingTab({
  termId,
  syllabus,
  onSyllabusChange,
}: SyllabusTrackingTabProps) {
  const [addingSubject, setAddingSubject] = useState<string | null>(null);
  const [newUnitName, setNewUnitName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [addingNewSubject, setAddingNewSubject] = useState(false);

  const addSubject = async () => {
    const name = newSubjectName.trim();
    if (!name) return;
    setAddingNewSubject(true);
    try {
      const res = await fetch(`/api/exams/terms/${termId}/syllabus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add subject");
      }
      setNewSubjectName("");
      onSyllabusChange();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add subject");
    } finally {
      setAddingNewSubject(false);
    }
  };

  const addUnit = async (subject: string) => {
    const unitName = newUnitName.trim();
    if (!unitName) return;
    try {
      const res = await fetch(`/api/exams/terms/${termId}/syllabus/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, unitName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add unit");
      setNewUnitName("");
      setAddingSubject(null);
      onSyllabusChange();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add unit");
    }
  };

  return (
    <div
      className="min-h-[400px] rounded-2xl p-6 -m-6 md:-mx-6 md:-mb-6 border border-white/5"
      style={{
        background: EXAM_GRADIENT_FULL,
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="space-y-8">
        <div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubject()}
              placeholder="Add new subject..."
              className="flex-1 max-w-xs rounded-lg px-3 py-2 text-sm border border-white/15 placeholder:opacity-70"
              style={{
                background: EXAM_INPUT_BG,
                color: EXAM_TEXT_MAIN,
              }}
            />
            <button
              type="button"
              onClick={addSubject}
              disabled={addingNewSubject || !newSubjectName.trim()}
              className="px-3 py-2 rounded-lg font-medium disabled:opacity-50 flex items-center gap-1 transition hover:opacity-90"
              style={{
                backgroundColor: EXAM_ACCENT,
                color: "#1A1A1A",
              }}
            >
              <Plus size={16} /> Add subject
            </button>
          </div>
        </div>

        {!syllabus.length ? (
          <div
            className="py-8 text-center text-sm"
            style={{ color: EXAM_TEXT_SECONDARY }}
          >
            No subjects yet. Add a subject above.
          </div>
        ) : null}

        {syllabus.map((s) => {
          const unitCount = s.units?.length ?? 0;
          const isAdding = addingSubject === s.subject;

          return (
            <div key={s.id} className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3
                  className="font-semibold"
                  style={{ color: EXAM_TEXT_MAIN }}
                >
                  {s.subject}
                </h3>
                <span
                  className="text-sm px-2 py-0.5 rounded"
                  style={{
                    color: EXAM_TEXT_SECONDARY,
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  {unitCount} Units
                </span>
                <div className="flex-1 flex items-center gap-2 min-w-[120px]">
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden max-w-[200px]"
                    style={{ background: EXAM_PROGRESS_EMPTY }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(s.completedPercent, 100)}%`,
                        background: getProgressBarColor(s.completedPercent),
                      }}
                    />
                  </div>
                  <span
                    className="text-sm tabular-nums"
                    style={{ color: EXAM_TEXT_MAIN }}
                  >
                    {s.completedPercent}%
                  </span>
                </div>
              </div>

              <ul className="space-y-2">
                {(s.units ?? []).map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center gap-4 p-3 rounded-xl border border-white/10"
                    style={{
                      background: EXAM_CARD_TRANSPARENT,
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <span
                      className="flex-1 font-medium"
                      style={{ color: EXAM_TEXT_MAIN }}
                    >
                      {u.unitName}
                    </span>
                    <div className="w-28 flex items-center gap-2">
                      <div
                        className="flex-1 h-2 rounded-full overflow-hidden"
                        style={{ background: EXAM_PROGRESS_EMPTY }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(u.completedPercent, 100)}%`,
                            background: getProgressBarColor(u.completedPercent),
                          }}
                        />
                      </div>
                      <span
                        className="text-xs tabular-nums w-8"
                        style={{ color: EXAM_TEXT_SECONDARY }}
                      >
                        {u.completedPercent}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {isAdding ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addUnit(s.subject)}
                    placeholder="Add new unit/topic..."
                    className="flex-1 rounded-lg px-3 py-2 text-sm border border-white/15 placeholder:opacity-70"
                    style={{
                      background: EXAM_INPUT_BG,
                      color: EXAM_TEXT_MAIN,
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => addUnit(s.subject)}
                    className="p-2.5 rounded-full transition hover:opacity-90"
                    style={{ backgroundColor: EXAM_ACCENT, color: "#1A1A1A" }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAddingSubject(s.subject);
                    setNewUnitName("");
                  }}
                  className="mt-2 text-sm flex items-center gap-1 transition hover:opacity-90"
                  style={{ color: EXAM_TEXT_SECONDARY }}
                >
                  <Plus size={14} /> Add new unit/topic...
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
