import { Receipt } from "lucide-react";

// --- Dummy Data ---
const DUMMY_FEE = {
  totalFee: 65000,
  amountPaid: 45000,
  remainingFee: 20000,
};

const DUMMY_PAYMENTS = [
  {
    id: "tx-101",
    amount: 25000,
    status: "Paid",
    method: "Online / UPI",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "tx-102",
    amount: 20000,
    status: "Paid",
    method: "Bank Transfer",
    createdAt: "2023-12-05T14:30:00Z",
  }
];

type Props = {
  fee?: {
    totalFee: number;
    amountPaid: number;
    remainingFee: number;
  } | null;
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
  }>;
};

export const FeeTransactions = ({ fee, payments }: Props) => {
  // FORCE dummy data if props are missing or empty strings/arrays
  const activeFee = fee && fee.totalFee > 0 ? fee : DUMMY_FEE;
  const activePayments = payments && payments.length > 0 ? payments : DUMMY_PAYMENTS;

  const totalPaid = activeFee.amountPaid;
  const total = activeFee.amountPaid + activeFee.remainingFee;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 mt-6 overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-lime-400" /> Fee Details & Transactions
        </h3>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">FEES PAID / TOTAL</p>
          <p className="text-2xl font-bold text-white">
            ₹{totalPaid.toLocaleString("en-IN")} <span className="text-gray-500">/ ₹{total.toLocaleString("en-IN")}</span>
          </p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] text-gray-400 font-bold tracking-wider uppercase border-b border-white/5">
              <th className="pb-4 font-medium">DATE</th>
              <th className="pb-4 font-medium">DESCRIPTION</th>
              <th className="pb-4 font-medium">METHOD</th>
              <th className="pb-4 font-medium">STATUS</th>
              <th className="pb-4 font-medium text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {activePayments.map((p) => (
              <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="py-5 text-gray-400">
                  {new Date(p.createdAt).toISOString().slice(0, 10)}
                </td>
                <td className="py-5 font-bold text-gray-100">Annual Fee</td>
                <td className="py-5 text-gray-400">{p.method || "Bank Transfer"}</td>
                <td className="py-5">
                  <span className="bg-lime-400/20 text-lime-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                    Paid
                  </span>
                </td>
                <td className="py-5 text-right font-bold text-white">₹{p.amount.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};