/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import {
  getAllReturnRequests,
  updateReturnStatus,
} from "@/services/returnRequest.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
  COMPLETED: "bg-blue-50 text-blue-700",
};

const TABS = ["ALL", "PENDING", "APPROVED", "REJECTED", "COMPLETED"];

export default function AdminReturnsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("PENDING");
  const [page, setPage] = useState(1);
  const limit = 15;

  const load = async () => {
    setLoading(true);
    const res = await getAllReturnRequests({
      page,
      limit,
      status: tab === "ALL" ? undefined : tab,
    });
    if (res?.success) {
      setRequests(res.data?.requests ?? res.data ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [tab, page]);

  const handleAction = async (id: number, status: "APPROVED" | "REJECTED") => {
    const label = status === "APPROVED" ? "Approve" : "Reject";
    if (!confirm(`${label} this return request?`)) return;
    const fd = new FormData();
    fd.append("data", JSON.stringify({ status }));
    const res = await updateReturnStatus(id, fd);
    if (res?.success) {
      toast.success(`Return ${status.toLowerCase()}`);
      load();
    } else toast.error("Failed");
  };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-bold text-gray-900">
        Return Requests
      </h2>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={cn(
              "shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all",
              tab === t
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No return requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {[
                    "Order #",
                    "Customer",
                    "Reason",
                    "Refund",
                    "Status",
                    "Date",
                    "Actions",
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
                {requests.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3 text-sm font-semibold">
                      #{r.order?.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.user?.accountInfo?.firstName}{" "}
                      {r.user?.accountInfo?.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[180px] truncate">
                      {r.reason}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-primary">
                      {formatBDT(r.refundAmount ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          STATUS_COLOR[r.status] ?? "bg-gray-50 text-gray-600",
                        )}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "PENDING" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAction(r.id, "APPROVED")}
                            className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <CheckCircle size={15} />
                          </button>
                          <button
                            onClick={() => handleAction(r.id, "REJECTED")}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <XCircle size={15} />
                          </button>
                        </div>
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
            <span className="text-xs text-gray-500">{total} requests</span>
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
