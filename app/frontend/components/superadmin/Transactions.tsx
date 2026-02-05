"use client";

import { useEffect, useState } from "react";
import PageHeader from "../common/PageHeader";

interface SchoolTurnover {
  slNo: number;
  id: string;
  name: string;
  turnover: number;
  studentCount: number;
}

export default function Transactions() {
  const [schools, setSchools] = useState<SchoolTurnover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTransactionCount, setTotalTransactionCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/superadmin/schools")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const list = (data.schools ?? []).map((s: { slNo: number; id: string; name: string; turnover: number; studentCount: number }, i: number) => ({
          slNo: i + 1,
          id: s.id,
          name: s.name,
          turnover: s.turnover ?? 0,
          studentCount: s.studentCount ?? 0,
        }));
        setSchools(list);
        setTotalTransactionCount(data.totalTransactionCount ?? 0);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const formatAmount = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const totalTurnover = schools.reduce((s, r) => s + r.turnover, 0);

  return (
    <main className="flex-1 overflow-y-auto px-3 sm:px-4">
      <div className="py-4 sm:p-6 min-h-screen space-y-6">
        <PageHeader
          title="Fees Transactions"
          subtitle="Turnover (total amount) per school"
        />

        {error && (
          <div className="text-red-400 text-sm py-2">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-white" />
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-white/80 w-20">
                      Sl. No
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-white/80">
                      School
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-white/80">
                      Total Students
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-white/80">
                      Turnover (Total Amount)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schools.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-white/60">
                        No schools
                      </td>
                    </tr>
                  ) : (
                    schools.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-white/10 hover:bg-white/5 transition"
                      >
                        <td className="px-4 py-3 text-white text-sm">{s.slNo}</td>
                        <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                        <td className="px-4 py-3 text-white/90 text-sm">
                          {s.studentCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-white font-medium">
                          {formatAmount(s.turnover)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {schools.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-wrap items-center justify-end gap-6">
                <span className="text-white/80 text-sm">
                  Total transactions: <strong className="text-white">{totalTransactionCount.toLocaleString()}</strong>
                </span>
                <span className="text-white/80 text-sm">
                  Total amount (all schools): <strong className="text-white">{formatAmount(totalTurnover)}</strong>
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
