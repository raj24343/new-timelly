"use client";

import { useEffect, useState } from "react";
import PageHeader from "../common/PageHeader";
import StatCard from "@/components/statCard";
import { Users, School, GraduationCap } from "lucide-react";

export interface SuperadminDashboardData {
  stats: { totalSchools: number; totalStudents: number; totalTeachers: number };
  schools: Array<{
    id: string;
    name: string;
    location: string;
    studentCount: number;
    teacherCount: number;
    classCount: number;
  }>;
  feeTransactions: Array<{
    id: string;
    slNo: number;
    amount: number;
    schoolId: string;
    schoolName: string;
    studentName: string;
    createdAt: string;
  }>;
}

export default function Dashboard() {
  const [data, setData] = useState<SuperadminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/superadmin/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 403 ? "Forbidden" : "Failed to load");
        return res.json();
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error loading dashboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto px-3 sm:px-4">
        <div className="py-4 sm:p-6 flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-white" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 overflow-y-auto px-3 sm:px-4">
        <div className="py-4 sm:p-6 text-center text-red-400">{error}</div>
      </main>
    );
  }

  const stats = data?.stats ?? { totalSchools: 0, totalStudents: 0, totalTeachers: 0 };
  const schools = data?.schools ?? [];
  const feeTransactions = data?.feeTransactions ?? [];

  const formatNumber = (n: number) => n.toLocaleString();

  return (
    <main className="flex-1 overflow-y-auto px-3 sm:px-4">
      <div className="py-4 sm:p-6 bg-transparent min-h-screen space-y-6">
        <PageHeader
          title="Superadmin Dashboard"
          subtitle="Manage everything from here"
          rightSlot={
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-3">
              <input
                type="text"
                placeholder="Search..."
                className="w-full sm:w-56 bg-[#2d2d2d] text-white px-3 py-2 rounded-lg focus:outline-none"
              />
              <button className="w-full sm:w-auto bg-[#404040] text-white px-4 py-2 rounded-lg">
                Add Admin
              </button>
            </div>
          }
        />

        <div className="flex flex-col lg:flex-row gap-[10px]">
          <div className="flex flex-col gap-[10px] w-full lg:w-1/2">
            <StatCard
              title="Total Schools"
              value={formatNumber(stats.totalSchools)}
              icon={<School size={24} />}
              footer="Active institutions"
            />
            <StatCard
              title="Total Students"
              value={formatNumber(stats.totalStudents)}
              icon={<Users size={24} />}
              footer="Across all schools"
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 md:p-5 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all duration-300 border border-white/10 group"
            />
            <StatCard
              title="Total Teachers"
              value={formatNumber(stats.totalTeachers)}
              icon={<GraduationCap size={24} />}
              footer="Across all schools"
            />
            <StatCard title="Schools" className="w-full">
              <div className="border border-white/10 rounded-xl overflow-hidden w-full">
                <div className="grid grid-cols-3 px-4 py-3 text-sm font-semibold text-white/80 gap-2">
                  <div>Sl. No</div>
                  <div>School</div>
                  <div>Students</div>
                </div>
                {schools.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-white/60">No schools yet</div>
                ) : (
                  schools.slice(0, 8).map((s, i) => (
                    <div key={s.id} className="grid grid-cols-3 items-center px-4 py-3 border-t border-white/10 text-sm gap-2">
                      <div className="text-white">{i + 1}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex-shrink-0" />
                        <span className="text-white font-medium truncate">{s.name}</span>
                      </div>
                      <div className="text-white/80">{formatNumber(s.studentCount)}</div>
                    </div>
                  ))
                )}
              </div>
            </StatCard>
          </div>

          <StatCard title="Fee Transactions" className="w-full lg:w-1/2">
            <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5">
              <div className="grid grid-cols-4 px-4 py-3 text-sm font-semibold text-white/80 gap-2">
                <div>Sl. No</div>
                <div>School</div>
                <div>Amount</div>
                <div>Date</div>
              </div>
              {feeTransactions.length === 0 ? (
                <div className="px-4 py-6 text-sm text-white/60">No transactions yet</div>
              ) : (
                feeTransactions.slice(0, 10).map((t) => (
                  <div key={t.id} className="grid grid-cols-4 items-center px-4 py-3 border-t border-white/10 text-sm gap-2">
                    <div className="text-white">{t.slNo}</div>
                    <div className="text-white truncate">{t.schoolName}</div>
                    <div className="text-white">₹{t.amount.toLocaleString()}</div>
                    <div className="text-white/70 text-xs">{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </StatCard>
        </div>
      </div>
    </main>
  );
}
