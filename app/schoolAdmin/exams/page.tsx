"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Calendar, Plus } from "lucide-react";
import RequireRole from "@/components/RequireRole";
import GlassCard from "@/components/ui/GlassCard";
import { useExamTerms, fetchExamTermDetail } from "@/hooks/useExamTerms";
import { useClasses } from "@/hooks/useClasses";
import ExamTermCard from "@/components/schoolAdmin/exams/ExamTermCard";
import NewExamTermModal from "@/components/schoolAdmin/exams/NewExamTermModal";
import ExamScheduleTab from "@/components/schoolAdmin/exams/ExamScheduleTab";
import SyllabusTrackingTab from "@/components/schoolAdmin/exams/SyllabusTrackingTab";
import type { ExamTermDetail } from "@/hooks/useExamTerms";
import {
  EXAM_ACCENT,
  EXAM_TEXT_SECONDARY,
  EXAM_GRADIENT_FULL,
  EXAM_TEXT_MAIN,
} from "@/app/frontend/constants/colors";

type TabId = "schedule" | "syllabus";

export default function ExamsPage() {
  return (
    <RequireRole allowedRoles={["SCHOOLADMIN"]}>
      <ExamsPageInner />
    </RequireRole>
  );
}

export function ExamsPageInner() {
  const { terms, loading, error, refetch } = useExamTerms();
  const { classes } = useClasses();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [termDetail, setTermDetail] = useState<ExamTermDetail | null>(null);
  const [tab, setTab] = useState<TabId>("syllabus");
  const [showAddModal, setShowAddModal] = useState(false);

  const upcoming = terms.filter((t) => t.status === "UPCOMING");
  const completed = terms.filter((t) => t.status === "COMPLETED");

  useEffect(() => {
    if (!selectedId) {
      setTermDetail(null);
      return;
    }
    let cancelled = false;
    fetchExamTermDetail(selectedId).then((detail) => {
      if (!cancelled) setTermDetail(detail);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleTermSaved = () => {
    refetch();
  };

  const handleSyllabusChange = () => {
    if (selectedId) {
      fetchExamTermDetail(selectedId).then(setTermDetail);
    }
  };

  const handleScheduleChange = () => {
    if (selectedId) {
      fetchExamTermDetail(selectedId).then(setTermDetail);
    }
  };

  const startsInDays = termDetail?.status === "UPCOMING" && termDetail?.schedules?.length
    ? (() => {
        const first = termDetail.schedules[0];
        const d = new Date(first.examDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
      })()
    : null;

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{ background: EXAM_GRADIENT_FULL, minHeight: "100vh" }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10"
              style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
            >
              <BookOpen className="w-6 h-6" style={{ color: EXAM_TEXT_MAIN }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: EXAM_TEXT_MAIN }}>
                Exams & Syllabus
              </h1>
              <p className="text-sm" style={{ color: EXAM_TEXT_SECONDARY }}>
                Manage examination schedules and syllabus tracking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition hover:opacity-90"
            style={{
              backgroundColor: EXAM_ACCENT,
              color: "#0b0616",
              boxShadow: `0 0 12px ${EXAM_ACCENT}40`,
            }}
          >
            <Plus size={18} /> Add Exam Term
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Exam terms list */}
          <div className="lg:col-span-1 space-y-4">
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            {loading ? (
              <div className="flex justify-center py-12">
                <div
                  className="animate-spin rounded-full h-10 w-10 border-2 border-white/30"
                  style={{ borderTopColor: EXAM_ACCENT }}
                />
              </div>
            ) : (
              <>
                {upcoming.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: EXAM_TEXT_SECONDARY }}>
                      Upcoming
                    </h3>
                    <div className="space-y-2">
                      {upcoming.map((t) => (
                        <ExamTermCard
                          key={t.id}
                          term={t}
                          isSelected={selectedId === t.id}
                          onClick={() => setSelectedId(t.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {completed.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider mb-2 mt-4" style={{ color: EXAM_TEXT_SECONDARY }}>
                      Completed
                    </h3>
                    <div className="space-y-2">
                      {completed.map((t) => (
                        <ExamTermCard
                          key={t.id}
                          term={t}
                          isSelected={selectedId === t.id}
                          onClick={() => setSelectedId(t.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {terms.length === 0 && (
                  <GlassCard variant="default" className="p-8 text-center" style={{ color: EXAM_TEXT_SECONDARY }}>
                    No exam terms. Click &quot;Add Exam Term&quot; to create one.
                  </GlassCard>
                )}
              </>
            )}
          </div>

          {/* Right: Term detail + tabs */}
          <div className="lg:col-span-2">
            {termDetail ? (
              <GlassCard variant="card" className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: EXAM_TEXT_MAIN }}>{termDetail.name}</h2>
                    {termDetail.description && (
                      <p className="text-sm mt-1" style={{ color: EXAM_TEXT_SECONDARY }}>{termDetail.description}</p>
                    )}
                  </div>
                  {startsInDays !== null && (
                    <div className="text-right">
                      <span className="text-sm" style={{ color: EXAM_TEXT_SECONDARY }}>
                        Starts in
                      </span>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: EXAM_ACCENT }}
                      >
                        {startsInDays}
                      </div>
                      <span className="text-sm" style={{ color: EXAM_TEXT_SECONDARY }}>
                        days
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 border-b mb-4" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                  <button
                    type="button"
                    onClick={() => setTab("schedule")}
                    className={`pb-2 px-1 text-sm font-medium transition-colors ${
                      tab === "schedule" ? "border-b-2" : ""
                    }`}
                    style={
                      tab === "schedule"
                        ? { color: EXAM_ACCENT, borderBottomColor: EXAM_ACCENT }
                        : { color: EXAM_TEXT_SECONDARY }
                    }
                  >
                    Exam Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("syllabus")}
                    className={`pb-2 px-1 text-sm font-medium transition-colors hover:text-white ${
                      tab === "syllabus" ? "border-b-2" : ""
                    }`}
                    style={
                      tab === "syllabus"
                        ? { color: EXAM_ACCENT, borderBottomColor: EXAM_ACCENT }
                        : { color: EXAM_TEXT_SECONDARY }
                    }
                  >
                    Syllabus Tracking
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {tab === "schedule" && (
                    <motion.div
                      key="schedule"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ExamScheduleTab
                        termId={termDetail.id}
                        schedules={termDetail.schedules ?? []}
                        onScheduleChange={handleScheduleChange}
                      />
                    </motion.div>
                  )}
                  {tab === "syllabus" && (
                    <motion.div
                      key="syllabus"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <SyllabusTrackingTab
                        termId={termDetail.id}
                        syllabus={termDetail.syllabus ?? []}
                        onSyllabusChange={handleSyllabusChange}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ) : (
              <GlassCard variant="card" className="p-12 text-center" style={{ color: EXAM_TEXT_SECONDARY }}>
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-60" style={{ color: EXAM_TEXT_MAIN }} />
                Select an exam term to view schedule and syllabus tracking
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <NewExamTermModal
            classes={classes}
            onClose={() => setShowAddModal(false)}
            onSaved={handleTermSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
