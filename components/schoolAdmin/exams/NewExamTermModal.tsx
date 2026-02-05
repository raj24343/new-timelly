"use client";

import { useState } from "react";
import { X } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { EXAM_TERM_STATUS } from "@/lib/constants";
import type { ClassItem } from "@/hooks/useClasses";

interface NewExamTermModalProps {
  classes: ClassItem[];
  onClose: () => void;
  onSaved: () => void;
}

export default function NewExamTermModal({
  classes,
  onClose,
  onSaved,
}: NewExamTermModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState("");
  const [status, setStatus] = useState<"UPCOMING" | "COMPLETED">("UPCOMING");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !classId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/exams/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          classId,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create term");
      onSaved();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2, 6, 23, 0.7)", backdropFilter: "blur(4px)" }}
    >
      <GlassCard
        variant="strong"
        className="w-full max-w-lg p-6 border border-[#333333] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-6">
          <h2 className="text-xl font-bold text-white">New Exam Term</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/80"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#808080] mb-1">Term Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Term 2 Examination"
              className="w-full bg-[#2d2d2d] border border-[#404040] rounded-lg px-3 py-2.5 text-white placeholder:text-[#6b6b6b]"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#808080] mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={3}
              className="w-full bg-[#2d2d2d] border border-[#404040] rounded-lg px-3 py-2.5 text-white placeholder:text-[#6b6b6b] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#808080] mb-1">Class</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full bg-[#2d2d2d] border border-[#404040] rounded-lg px-3 py-2.5 text-white"
                required
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.section ?? ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#808080] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "UPCOMING" | "COMPLETED")}
                className="w-full bg-[#2d2d2d] border border-[#404040] rounded-lg px-3 py-2.5 text-white"
              >
                {EXAM_TERM_STATUS.map((s: { value: string; label: string }) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#404040] border border-[#333333] text-white font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-500/80 to-green-600/80 border border-green-500/30 text-white font-medium disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Term"}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
