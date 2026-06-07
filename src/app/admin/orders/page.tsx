/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import { getAllOrders, updateOrderStatus } from "@/services/order.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-purple-50 text-purple-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const STATUSES = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
const NEXT_STATUS: Record<string, string> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  const load = async () => {
    setLoading(true);
    const res = await getAllOrders({
      page,
      limit,
      status: status === "ALL" ? undefined : status,
      search: search || undefined,
    });
    if (res?.success) {
      setOrders(res.data?.orders ?? res.data ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [status, page]);

  const handleAdvanceStatus = async (id: number, current: string) => {
    const next = NEXT_STATUS[current];
    if (!next) return;
    if (!confirm(`Mark as ${next}?`)) return;
    const fd = new FormData();
    fd.append("data", JSON.stringify({ status: next }));
    const res = await updateOrderStatus(id, fd);
    if (res?.success) {
      toast.success(`Order → ${next}`);
      load();
    } else toast.error("Failed");
  };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-bold text-gray-900">Orders</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search by order number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={cn(
                "shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                status === s
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600",
              )}
            >
              {s === "ALL" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {[
                    "Order #",
                    "Customer",
                    "Items",
                    "Total",
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
                {orders.map((o, i) => (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      #{o.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">
                        {o.user?.accountInfo?.firstName}{" "}
                        {o.user?.accountInfo?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{o.user?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {o.items?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-primary">
                      {formatBDT(o.totalAmount ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          STATUS_COLOR[o.status] ?? "bg-gray-50 text-gray-600",
                        )}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {NEXT_STATUS[o.status] && (
                        <button
                          onClick={() => handleAdvanceStatus(o.id, o.status)}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          → {NEXT_STATUS[o.status]}
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
            <span className="text-xs text-gray-500">{total} orders</span>
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
