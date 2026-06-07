/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { getAllWalletTransactions } from "@/services/wallet.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

const TYPE_COLOR: Record<string, string> = {
  CREDIT: "bg-green-50 text-green-700",
  DEBIT: "bg-red-50 text-red-700",
  REFUND: "bg-blue-50 text-blue-700",
  CASHBACK: "bg-purple-50 text-purple-700",
};

const TYPE_TABS = ["ALL", "CREDIT", "DEBIT", "REFUND"];

export default function AdminWalletPage() {
  const [txns, setTxns] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 15;

  const load = async () => {
    setLoading(true);
    const res = await getAllWalletTransactions({
      page,
      limit,
      type: type === "ALL" ? undefined : type,
    });
    if (res?.success) {
      setTxns(res.data?.transactions ?? res.data ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [type, page]);

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-bold text-gray-900">
        Wallet Transactions
      </h2>

      <div className="flex gap-2">
        {TYPE_TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setType(t);
              setPage(1);
            }}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-medium transition-all",
              type === t
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-600",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : txns.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {["User", "Amount", "Type", "Description", "Date"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold text-gray-500 px-4 py-3"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {txns.map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {t.user?.accountInfo?.firstName}{" "}
                        {t.user?.accountInfo?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{t.user?.email}</p>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-sm font-bold",
                        t.type === "DEBIT" ? "text-red-500" : "text-green-600",
                      )}
                    >
                      {t.type === "DEBIT" ? "-" : "+"}
                      {formatBDT(t.amount ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          TYPE_COLOR[t.type] ?? "bg-gray-50 text-gray-600",
                        )}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">
                      {t.description ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(t.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">{total} transactions</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs text-gray-500">
                {page} / {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / limit)}
                className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
