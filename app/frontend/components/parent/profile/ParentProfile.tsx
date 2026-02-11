"use client";

import { useState } from "react";
import {
  Download,
  Upload,
  GraduationCap,
  Award,
  TrendingUp,
  Book,
  Clock,
  Calendar,
  Save,
  BookOpen,
} from "lucide-react";

/* =========================
   PROFILE HEADER (UNCHANGED)
   ========================= */
function ProfileHeader() {
  return (
    <section className=" bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Student Profile</h1>
          <p className="text-white/60">
            Manage student records and information
          </p>
        </div>

        <div className="flex gap-3">
          <button className="bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full text-white flex gap-2 hover:bg-white/10">
            <Download size={18} /> Download Report
          </button>
          <button className="bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full text-white flex gap-2 hover:bg-white/10">
            <Upload size={18} /> Upload CSV
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================
   STUDENT INFO (VIEW ONLY)
   ========================= */
function ProfileView() {
  return (
    <section className="rounded-3xl p-10 bg-white/5 backdrop-blur-md border border-white/10">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-4 rounded-2xl bg-lime-400/20">
              <GraduationCap className="text-lime-400" />
            </div>

            <h2 className="text-4xl font-bold text-white">
              Aarav Kumar
            </h2>
          </div>

          <p className="text-white/60 mb-8">
            Student Profile Overview
          </p>

          <div className="space-y-4">
            <div className="flex gap-4">
              <InfoTag value="10A" />
              <InfoTag value="Roll: 15" />
            </div>

            <div className="flex gap-4">
              <InfoTag value="ADM2023/1015" />
              <InfoTag value="2025–2026" />
            </div>
          </div>
        </div>

        <img
          src="/student.png"
          alt="student"
          className="h-56 drop-shadow-2xl"
        />
      </div>
    </section>
  );
}

/* =========================
   INFO TAG
   ========================= */
function InfoTag({ value }: { value: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full text-white">
      {value}
    </div>
  );
}

/* =========================
   TYPES
   ========================= */
import { BarChart3 } from "lucide-react";

/* =========================
   TYPES
   ========================= */
type Subject = {
  name: string;
  value: number;
};

/* =========================
   SUBJECT DATA
   ========================= */
const subjects: Subject[] = [
  { name: "Math", value: 85 },
  { name: "Science", value: 78 },
  { name: "English", value: 92 },
  { name: "Hindi", value: 88 },
  { name: "Soc. Sci", value: 95 },
];

/* =========================
   ACADEMIC PERFORMANCE
   ========================= */
function AcademicPerformance() {
  const chartHeight = 240;
  const maxValue = 100;

  return (
    <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
          <BarChart3 className="w-6 h-6 text-lime-400" />
          Academic Performance
        </h2>

        <select className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-white">
          <option>Term 1</option>
          <option>Term 2</option>
        </select>
      </div>

      {/* Chart */}
      <div className="flex gap-6">
        {/* Y Axis */}
        <div
          className="flex flex-col justify-between text-white/60 text-sm"
          style={{ height: chartHeight }}
        >
          {[100, 75, 50, 25, 0].map((val) => (
            <span key={val}>{val}</span>
          ))}
        </div>

        {/* Bars Area */}
        <div
          className="relative flex flex-1 items-end justify-between"
          style={{ height: chartHeight }}
        >
          {/* Grid lines */}
          {[25, 50, 75, 100].map((val) => (
            <div
              key={val}
              className="absolute left-0 right-0 border-t border-white/10"
              style={{
                bottom: `${(val / maxValue) * chartHeight}px`,
              }}
            />
          ))}

          {/* Bars */}
          {subjects.map((s) => (
            <div
              key={s.name}
              tabIndex={0}
              className="relative group flex flex-col items-center z-10 focus:outline-none"
            >
              {/* Tooltip */}
              <div className="
                absolute left-16 top-1/2 -translate-y-1/2
                opacity-0 scale-95
                group-hover:opacity-100
                group-hover:scale-100
                group-focus-within:opacity-100
                group-focus-within:scale-100
                transition
                bg-black/90 text-white text-xs
                px-8 py-4 rounded-lg shadow-lg
                whitespace-nowrap
              ">
                <div className="font-semibold">{s.name}</div>
                <div>Score: {s.value}</div>
              </div>

              {/* Bar */}
              <div
                style={{
                  height: `${(s.value / maxValue) * chartHeight}px`,
                }}
                className="w-14 rounded-xl bg-lime-400 flex justify-center pt-2 text-black font-bold transition hover:bg-lime-300 cursor-pointer"
              >
                {s.value}
              </div>

              {/* Subject Label */}
              <span className="text-white/80 mt-2 text-sm">
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================
   STATS
   ========================= */
const stats = [
  { label: "OVERALL GRADE", value: "A+", icon: Award },
  { label: "ATTENDANCE", value: "95.8%", icon: TrendingUp },
  { label: "TOTAL ASSIGNMENTS", value: "42", icon: BookOpen },
  { label: "PENDING HOMEWORK", value: "3", icon: Clock },
  { label: "UPCOMING EVENTS", value: "2", icon: Calendar },
];


function ProfileStatCard() {
  return (
    <div className="grid md:grid-cols-5 gap-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:scale-105 transition"
        >
          <s.icon className="mx-auto text-lime-400 mb-3" />
          <h3 className="text-3xl font-bold text-white">{s.value}</h3>
          <p className="text-white/60 text-sm">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* =========================
   STUDENT DETAILS (EDITABLE)
   ========================= */
function StudentDetails() {
  const [details, setDetails] = useState({
    fullName: "Aarav Kumar",
    studentId: "ADM2023/1015",
    gender: "Male",
    age: "15",
    dob: "15/08/2010",
    previousSchool: "Delhi Public School",
    class: "10",
    section: "A",
    status: "Active",
  });

  return (
    <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10">
      <h2 className="text-2xl font-bold text-white mb-6">
        Student Details
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(details).map(([key, value]) => (
          <div key={key}>
            <p className="text-white/50 text-sm mb-1 capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </p>
            <input
              value={value}
              onChange={(e) =>
                setDetails({ ...details, [key]: e.target.value })
              }
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-3 text-white bg-transparent outline-none focus:ring-2 focus:ring-lime-400"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================
   PARENT INFO
   ========================= */
function ParentInformation() {
  const [parentName, setParentName] = useState("Mr. Rajesh Kumar");
  const [contact, setContact] = useState("+91 98765 43210");

  return (
    <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        Parent Information
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <EditableInfo
          label="Parent Name"
          value={parentName}
          onChange={setParentName}
        />
        <EditableInfo
          label="Contact Number"
          value={contact}
          onChange={setContact}
        />
      </div>

      <div className="flex justify-end mt-8">
        <button className="bg-lime-400 text-black px-8 py-3 rounded-full font-bold flex gap-2">
          <Save /> Save Student
        </button>
      </div>
    </section>
  );
}

function EditableInfo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-white/50 text-sm mb-1">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-3 text-white bg-transparent outline-none focus:ring-2 focus:ring-lime-400"
      />
    </div>
  );
}

/* =========================
   MAIN PAGE
   ========================= */
export default function StudentPage() {
  return (
    <div className="min-h-screen p-8">
      <main className="space-y-8">
        <ProfileHeader />
        <ProfileView />
        <AcademicPerformance />
        <ProfileStatCard />
        <StudentDetails />
        <ParentInformation />
      </main>
    </div>
  );
}
