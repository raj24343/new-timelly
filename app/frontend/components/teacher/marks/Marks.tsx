

"use client";

import { useState } from "react";
import PageHeader from "../../common/PageHeader";
import { SelectField } from "./MarksSelectField";
import { Download, Save, Upload } from "lucide-react";
import DataTable from "../../common/TableLayout";
import { Column } from "@/app/frontend/types/superadmin";

/* ---------------- TYPES ---------------- */

type StudentRow = {
  id: number;
  rollNo: string;
  name: string;
  avatar: string;
  marks: number | "";
  maxMarks: number;
};

/* ---------------- MOCK DATA ---------------- */

const INITIAL_STUDENTS: StudentRow[] = [
  { id: 1, rollNo: "01", name: "Aarav Kumar", avatar: "https://i.pravatar.cc/40?img=1", marks: 92, maxMarks: 100 },
  { id: 2, rollNo: "02", name: "Aditi Sharma", avatar: "https://i.pravatar.cc/40?img=2", marks: 85, maxMarks: 100 },
  { id: 3, rollNo: "03", name: "Arjun Patel", avatar: "https://i.pravatar.cc/40?img=3", marks: 78, maxMarks: 100 },
  { id: 4, rollNo: "04", name: "Diya Gupta", avatar: "https://i.pravatar.cc/40?img=4", marks: 90, maxMarks: 100 },
  { id: 5, rollNo: "05", name: "Kabir Singh", avatar: "https://i.pravatar.cc/40?img=5", marks: 82, maxMarks: 100 },
  { id: 6, rollNo: "06", name: "Meera Reddy", avatar: "https://i.pravatar.cc/40?img=6", marks: 87, maxMarks: 100 },
  { id: 7, rollNo: "07", name: "Rohan Das", avatar: "https://i.pravatar.cc/40?img=7", marks: 75, maxMarks: 100 },
  { id: 8, rollNo: "08", name: "Saanvi Joshi", avatar: "https://i.pravatar.cc/40?img=8", marks: 86, maxMarks: 100 },
];

export default function TeacherMarksTab() {
  const [form, setForm] = useState({
    class: "10-A",
    section: "Section A",
    subject: "Mathematics",
    examType: "Term 1",
  });

  const [activeBtn, setActiveBtn] =
    useState<null | "save" | "import" | "export">(null);

  const [rows, setRows] = useState<StudentRow[]>(INITIAL_STUDENTS);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------------- MARKS LOGIC ---------------- */

  const updateMarks = (id: number, value: string) => {
    const num =
      value === "" ? "" : Math.min(100, Math.max(0, Number(value)));

    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, marks: num } : r))
    );
  };

  const getPercentage = (m: number | "", max: number) =>
    m === "" ? "--" : `${((m / max) * 100).toFixed(1)}%`;

  const getGrade = (m: number | "") => {
    if (m === "") return "--";
    if (m >= 90) return "A+";
    if (m >= 80) return "A";
    if (m >= 70) return "B+";
    if (m >= 60) return "B";
    return "C";
  };

  const total = rows.length;
  const entered = rows.filter((r) => r.marks !== "").length;
  const pending = total - entered;

  /* ---------------- DESKTOP TABLE COLUMNS ---------------- */

  const columns: Column<StudentRow>[] = [
    { header: "ROLL NO", accessor: "rollNo" },

    {
      header: "STUDENT NAME",
      render: (row: StudentRow) => (
        <div className="flex items-center gap-3">
          <img src={row.avatar} alt={row.name} className="w-9 h-9 rounded-full" />
          <span className="font-medium text-white">{row.name}</span>
        </div>
      ),
    },

    {
      header: "MARKS OBTAINED",
      align: "center",
      render: (row: StudentRow) => (
        <input
          type="number"
          value={row.marks}
          onChange={(e) => updateMarks(row.id, e.target.value)}
          className="w-20 text-center rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-white outline-none"
        />
      ),
    },

    { header: "MAX MARKS", align: "center", accessor: "maxMarks" },

    {
      header: "PERCENTAGE",
      align: "center",
      render: (row: StudentRow) => (
        <span className="font-medium text-white">
          {getPercentage(row.marks, row.maxMarks)}
        </span>
      ),
    },

    {
      header: "GRADE",
      align: "center",
      render: (row: StudentRow) => {
        const g = getGrade(row.marks);
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs border ${
              g === "A+"
                ? "bg-lime-400/10 text-lime-400 border-lime-400/30"
                : "bg-white/5 text-gray-200 border-white/20"
            }`}
          >
            {g}
          </span>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen text-white px-3 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto space-y-6">

        <PageHeader
          title="Marks Entry"
          subtitle="Enter and manage student marks for your classes"
        />

        {/* FILTER BAR */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SelectField label="CLASS" value={form.class} onChange={(v) => handleChange("class", v)} options={["10-A", "10-B", "9-A"]}  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-lime-400/50 text-white text-sm" />
            <SelectField label="SECTION" value={form.section} onChange={(v) => handleChange("section", v)} options={["Section A", "Section B"]}   className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-lime-400/50 text-white text-sm"/>
            <SelectField label="SUBJECT" value={form.subject} onChange={(v) => handleChange("subject", v)} options={["Mathematics", "Science", "English"]}  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-lime-400/50 text-white text-sm" />
            <SelectField label="EXAM TYPE" value={form.examType} onChange={(v) => handleChange("examType", v)} options={["Term 1", "Term 2", "Final"]}  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-lime-400/50 text-white text-sm" />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4">
          {[
            { key: "save", label: "Save Marks", icon: Save },
            { key: "import", label: "Import Excel", icon: Upload },
            { key: "export", label: "Export Excel", icon: Download },
          ].map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.key}
                onClick={() => setActiveBtn(btn.key as any)}
                className={`px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-medium transition
                  ${
                    activeBtn === btn.key
                      ? "bg-lime-400/20 text-lime-400 border border-lime-400/40 shadow-md"
                      : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
                  }`}
              >
                <Icon size={16} />
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* TABLE CARD */}
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col">

          {/* HEADER WITH DYNAMIC SELECTION */}
          <div className="p-6 border-b border-white/10 bg-white/[0.02]">
            <h3 className="font-bold text-white text-lg">Enter Marks</h3>

            <div className="flex items-center gap-2 mt-2 text-sm text-white/60">
              <span>{form.class}</span>
              <span className="w-1 h-1 rounded-full bg-white/40"></span>
              <span>{form.subject}</span>
              <span className="w-1 h-1 rounded-full bg-white/40"></span>
              <span className="text-lime-400 font-medium">
                {form.examType}
              </span>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block">
            <DataTable<StudentRow>
              columns={columns}
              rounded={false}
              data={rows}
              rowKey={(row) => row.id}
            />
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-4 p-4">
            {rows.map((student) => {
              const percentage = getPercentage(student.marks, student.maxMarks);
              const grade = getGrade(student.marks);

              return (
                <div
                  key={student.id}
                  className="rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-purple-700/40 via-indigo-700/30 to-purple-900/40 backdrop-blur-xl shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full" />
                      <div>
                        <div className="text-white font-semibold">{student.name}</div>
                        <div className="text-xs text-white/60">Roll : {student.rollNo}</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs border bg-lime-400/20 text-lime-400 border-lime-400/40">
                      {grade}
                    </span>
                  </div>

                  <div className="mt-5 flex justify-between text-sm">
                    <span className="text-white/60">Calculated Percentage</span>
                    <span className="text-white font-semibold">{percentage}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* FOOTER */}
<div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-white/[0.02] border-t border-white/10">
  
  <div className="flex gap-6 text-sm">
    <span className="text-gray-400">
      TOTAL <span className="text-white font-semibold ml-1">{total}</span>
    </span>

    <span className="text-lime-400">
      ENTERED <span className="font-semibold ml-1">{entered}</span>
    </span>

    <span className="text-red-400">
      PENDING <span className="font-semibold ml-1">{pending}</span>
    </span>
  </div>

  <button
    disabled={pending > 0}
    className={`px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition
      ${
        pending === 0
          ? "bg-lime-400/20 text-lime-400 border border-lime-400/30 hover:shadow-[0_0_15px_rgba(163,230,53,0.2)]"
          : "bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed"
      }`}
  >
    <Save size={16} />
    Save All Marks
  </button>

</div>


        </div>

      </div>
    </div>
  );
}
