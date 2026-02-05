"use client";

import { useEffect, useState } from "react";
import PageHeader from "../common/PageHeader";
import { Search } from "lucide-react";

export interface SchoolRow {
  slNo: number;
  id: string;
  name: string;
  address: string;
  location: string;
  studentCount: number;
  teacherCount: number;
  classCount: number;
  turnover: number;
  admin: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    role: string;
  } | null;
}

export default function Schools() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/superadmin/schools?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load schools");
      setSchools(data.schools ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading schools");
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleSearch = () => {
    fetchSchools();
  };

  const formatAmount = (n: number) =>
    n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : `₹${n.toLocaleString()}`;

  return (
    <main className="flex-1 overflow-y-auto px-3 sm:px-4">
      <div className="py-4 sm:p-6 min-h-screen space-y-6">
        <PageHeader
          title="Schools"
          subtitle="Manage all schools"
          rightSlot={
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by School"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full sm:w-56 bg-[#2d2d2d] text-white px-3 py-2 rounded-lg focus:outline-none border border-white/10"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="bg-[#404040] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Search size={18} /> Search
                </button>
              </div>
            </div>
          }
        />

        {error && (
          <div className="text-red-400 text-sm py-2">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-white" />
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-white/80 w-12">
                      <input type="checkbox" readOnly className="rounded" />
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-white/80 w-14">
                      Admin Id
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-white/80">
                      School Name
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-white/80">
                      Admin Name
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-white/80">
                      Contact
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-white/80">
                      Admin Role
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-white/80">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-white/80">
                      Total Students
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-white/80">
                      Turnover (Amount)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schools.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-white/60">
                        No schools found
                      </td>
                    </tr>
                  ) : (
                    schools.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-white/10 hover:bg-white/5 transition"
                      >
                        <td className="px-4 py-3">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="px-4 py-3 text-white text-sm">
                          {String(s.slNo).padStart(2, "0")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex-shrink-0" />
                            <span className="text-white font-medium">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/90 text-sm">
                          {s.admin?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-white/90 text-sm">
                          {s.admin?.mobile ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-white/90 text-sm">
                          {s.admin?.role ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-white/90 text-sm truncate max-w-[180px]">
                          {s.admin?.email ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-white text-sm">
                          {s.studentCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-white font-medium text-sm">
                          {formatAmount(s.turnover)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {schools.length > 0 && (
              <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-sm text-white/60">
                <span>Page 1 of {Math.max(1, Math.ceil(schools.length / 10))}</span>
                <div className="flex gap-2">
                  <button type="button" className="px-3 py-1 rounded bg-white/10 disabled:opacity-50" disabled>
                    Previous
                  </button>
                  <button type="button" className="px-3 py-1 rounded bg-white/10 disabled:opacity-50" disabled>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
