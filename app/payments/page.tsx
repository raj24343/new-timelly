"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import PayButton from "@/components/PayButton";

interface StudentFee {
  id: string;
  totalFee: number;
  discountPercent: number;
  finalFee: number;
  amountPaid: number;
  remainingFee: number;
  installments: number;
}

interface FeeWithStudent extends StudentFee {
  student: {
    id: string;
    user: { id: string; name: string | null; email: string | null };
    class: { id: string; name: string; section: string | null } | null;
  };
}

interface FeeStats {
  totalStudents: number;
  paid: number;
  pending: number;
  totalCollected: number;
  totalDue: number;
}

export default function Page() {
  const { data: session, status } = useSession();
  const [fee, setFee] = useState<StudentFee | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<1 | 3>(1);
  const [adminFees, setAdminFees] = useState<FeeWithStudent[]>([]);
  const [stats, setStats] = useState<FeeStats | null>(null);
  const [selectedFee, setSelectedFee] = useState<FeeWithStudent | null>(null);
  const [totalFeeInput, setTotalFeeInput] = useState<number | "">("");
  const [discountInput, setDiscountInput] = useState<number | "">("");
  const [installmentsInput, setInstallmentsInput] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const fetchFee = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/fees/mine");
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to fetch fee details");
        return;
      }
      setFee(data.fee);
    } catch (err) {
      console.error("Fetch fee error:", err);
      alert("Something went wrong while fetching fee details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/fees/summary");
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to fetch fees");
        return;
      }
      setAdminFees(data.fees || []);
      setStats(data.stats || null);
      if (data.fees?.length) {
        const first = data.fees[0];
        setSelectedFee(first);
        setTotalFeeInput(first.totalFee);
        setDiscountInput(first.discountPercent);
        setInstallmentsInput(first.installments);
      } else {
        setSelectedFee(null);
      }
    } catch (err) {
      console.error("Fetch admin fees error:", err);
      alert("Something went wrong while fetching fee details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    const role = session?.user?.role;
    if (role === "STUDENT") {
      fetchFee();
    } else if (role === "SCHOOLADMIN" || role === "SUPERADMIN") {
      fetchAdminSummary();
    } else {
      setLoading(false);
    }
  }, [status, session?.user?.role]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-700 font-medium">Loading payment details...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-red-600 font-semibold">
            Please sign in to view payments.
          </p>
        </div>
      </div>
    );
  }

  const role = session.user.role;

  if (role === "STUDENT" && !fee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-red-600 font-semibold">
            Fee details not configured for your profile. Please contact admin.
          </p>
        </div>
      </div>
    );
  }

  if (role !== "STUDENT" && role !== "SCHOOLADMIN" && role !== "SUPERADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-red-600 font-semibold">
            Payments are available for students and school admins.
          </p>
        </div>
      </div>
    );
  }

  if (role === "STUDENT" && fee) {
    const remainingAmount = fee.remainingFee;
    const payable = plan === 1 ? remainingAmount : remainingAmount / plan;
    const progress =
      fee.finalFee > 0 ? Math.min((fee.amountPaid / fee.finalFee) * 100, 100) : 0;

    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-green-700">
              Complete Your Payment
            </h2>
            <p className="text-gray-500">
              Total Fee: <span className="font-semibold">₹{fee.totalFee}</span>
            </p>
            <p className="text-gray-500 text-sm">
              Discount: {fee.discountPercent}% &nbsp; | &nbsp; Payable after discount:{" "}
              <span className="font-semibold">₹{fee.finalFee}</span>
            </p>
            <p className="text-gray-500 text-sm">
              Paid: <span className="font-semibold">₹{fee.amountPaid}</span> &nbsp; | &nbsp;
              Remaining: <span className="font-semibold">₹{fee.remainingFee}</span>
            </p>
          </div>

          {/* Plan Selector */}
          <div className="space-y-3">
            {[1, 3].map((p) => (
              <motion.button
                whileTap={{ scale: 0.97 }}
                key={p}
                onClick={() => setPlan(p as 1 | 3)}
                className={`w-full p-4 rounded-xl border flex justify-between items-center transition
                ${
                  plan === p
                    ? "border-green-600 bg-green-100 text-green-700"
                    : "border-gray-200 hover:border-green-400"
                }`}
              >
                <span className="font-medium">
                  {p === 1 ? "Pay Full Remaining" : `${p} Installments`}
                </span>
                <span className="font-semibold">
                  ₹{(remainingAmount / p).toFixed(2)}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="bg-green-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Pay Now</span>
              <span className="font-bold text-green-700">
                ₹{payable.toFixed(2)}
              </span>
            </div>

            {plan !== 1 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Remaining</span>
                <span>₹{(remainingAmount - payable).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {fee.finalFee > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1 text-gray-500">
                <span>Payment Progress</span>
                <span>
                  ₹{fee.amountPaid.toFixed(2)} / ₹{fee.finalFee.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-2 bg-green-600 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Pay Button */}
          {remainingAmount <= 0 ? (
            <div className="flex items-center justify-center gap-2 text-green-700">
              <CheckCircle />
              <span className="font-semibold">All fees paid. Thank you!</span>
            </div>
          ) : (
            <PayButton amount={payable} onSuccess={fetchFee} />
          )}
        </motion.div>
      </div>
    );
  }

  // Admin view
  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-2xl shadow p-4 border border-green-100 space-y-3">
          {stats && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-gray-600">Paid</p>
                <p className="text-lg font-bold text-green-700">{stats.paid}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <p className="text-gray-600">Pending</p>
                <p className="text-lg font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 col-span-2">
                <p className="text-gray-600">Collected</p>
                <p className="text-lg font-bold text-emerald-700">₹{stats.totalCollected}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-100 col-span-2">
                <p className="text-gray-600">Due</p>
                <p className="text-lg font-bold text-red-700">₹{stats.totalDue}</p>
              </div>
            </div>
          )}
          <h2 className="text-lg font-bold text-green-700 mb-3">Students</h2>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {adminFees.map((feeItem) => (
              <button
                key={feeItem.student.id}
                onClick={() => {
                  setSelectedFee(feeItem);
                  setTotalFeeInput(feeItem.totalFee);
                  setDiscountInput(feeItem.discountPercent);
                  setInstallmentsInput(feeItem.installments);
                }}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  selectedFee?.student.id === feeItem.student.id
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <div className="font-semibold text-green-800">
                  {feeItem.student.user.name || "Unnamed"}
                </div>
                <div className="text-xs text-gray-500">
                  {feeItem.student.user.email || "No email"}
                </div>
                {feeItem.student.class && (
                  <div className="text-xs text-gray-600 mt-1">
                    {feeItem.student.class.name}
                    {feeItem.student.class.section ? ` - ${feeItem.student.class.section}` : ""}
                  </div>
                )}
              </button>
            ))}
            {adminFees.length === 0 && (
              <p className="text-sm text-gray-500">No students found.</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl shadow p-6 border border-green-100">
          {selectedFee ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Selected Student</p>
                  <h3 className="text-2xl font-bold text-green-700">
                    {selectedFee.student.user.name || "Student"}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedFee.student.user.email}</p>
                </div>
              </div>

              {selectedFee ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <p className="text-sm text-gray-600">Total Fee</p>
                      <p className="text-2xl font-bold text-green-700">₹{selectedFee.totalFee}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <p className="text-sm text-gray-600">Discount</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {selectedFee.discountPercent}%
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                      <p className="text-sm text-gray-600">Payable</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        ₹{selectedFee.finalFee}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <p className="text-sm text-gray-600">Paid</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        ₹{selectedFee.amountPaid}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Remaining</span>
                      <span className="font-semibold text-green-700">₹{selectedFee.remainingFee}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            (selectedFee.amountPaid / selectedFee.finalFee) * 100,
                            100
                          ).toFixed(1)}%`,
                        }}
                        className="h-2 bg-green-600"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Installments allowed: {selectedFee.installments}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-3">
                    <h4 className="font-semibold text-green-700 text-sm">Update Fees</h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="space-y-1">
                        <label className="text-gray-500">Total Fee</label>
                        <input
                          type="number"
                          value={totalFeeInput}
                          onChange={(e) => setTotalFeeInput(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500">Discount %</label>
                        <input
                          type="number"
                          value={discountInput}
                          onChange={(e) =>
                            setDiscountInput(e.target.value === "" ? "" : Number(e.target.value))
                          }
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500">Installments</label>
                        <input
                          type="number"
                          value={installmentsInput}
                          onChange={(e) =>
                            setInstallmentsInput(e.target.value === "" ? "" : Number(e.target.value))
                          }
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                    <button
                      disabled={saving}
                      onClick={async () => {
                        if (!selectedFee) return;
                        setSaving(true);
                        try {
                          const res = await fetch(`/api/fees/student/${selectedFee.student.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              totalFee:
                                totalFeeInput === "" ? undefined : Number(totalFeeInput),
                              discountPercent:
                                discountInput === "" ? undefined : Number(discountInput),
                              installments:
                                installmentsInput === "" ? undefined : Number(installmentsInput),
                            }),
                          });
                          const data = await res.json();
                          if (!res.ok) {
                            alert(data.message || "Failed to update fee");
                            return;
                          }
                          const updatedFee = data.fee as StudentFee;
                          const merged: FeeWithStudent = { ...updatedFee, student: selectedFee.student };
                          setSelectedFee(merged);
                          setAdminFees((prev) =>
                            prev.map((f) =>
                              f.student.id === selectedFee.student.id ? merged : f
                            )
                          );
                          fetchAdminSummary();
                        } finally {
                          setSaving(false);
                        }
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No fee record for this student.</p>
              )}
            </>
          ) : (
            <p className="text-gray-500">Select a student to view payment details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
