/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { getAllPayments, initiateRefund } from "@/services/payment.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

const STATUS_COLOR: Record<string, string> = {
  PAID: "bg-green-50 text-green-700",
  PENDING: "bg-yellow-50 text-yellow-700",
  FAILED: "bg-red-50 text-red-700",
  REFUNDED: "bg-purple-50 text-purple-700",
};

const METHOD_TABS = [
  "ALL",
  "CASH_ON_DELIVERY",
  "CREDIT_CARD",
  "MOBILE_BANKING",
];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 15;

  const load = async () => {
    setLoading(true);
    const res = await getAllPayments({
      page,
      limit,
      method: method === "ALL" ? undefined : method,
    });
    if (res?.success) {
      setPayments(res.data?.payments ?? res.data ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [method, page]);

  const handleRefund = async (orderId: number, orderNum: string) => {
    if (!confirm(`Refund order #${orderNum}?`)) return;
    const res = await initiateRefund(orderId);
    if (res?.success) {
      toast.success("Refund initiated");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Payments
        </h2>
        <button
          onClick={load}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {METHOD_TABS.map((m) => (
          <button
            key={m}
            onClick={() => {
              setMethod(m);
              setPage(1);
            }}
            className={cn(
              "shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all",
              method === m
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-600",
            )}
          >
            {m === "ALL" ? "All" : m.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {[
                    "Order #",
                    "Amount",
                    "Method",
                    "Status",
                    "Date",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-500 px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      #{p.order?.orderNumber ?? p.orderId}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-primary">
                      {formatBDT(p.amount ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {p.method?.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          STATUS_COLOR[p.status] ?? "bg-gray-50 text-gray-600",
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {p.status === "PAID" && (
                        <button
                          onClick={() =>
                            handleRefund(p.orderId, p.order?.orderNumber)
                          }
                          className="text-xs text-red-500 hover:underline"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">{total} payments</span>
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
