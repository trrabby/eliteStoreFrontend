/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, RefreshCw, XCircle, Clock, Wallet } from "lucide-react";
import {
  getAllWithdrawRequests,
  updateWithdrawRequestStatus,
} from "@/services/vendorWithdraw.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Image from "next/image";

const STATUS_META: Record<string, { color: string; icon: any }> = {
  PENDING: { color: "bg-yellow-50 text-yellow-700", icon: Clock },
  PROCESSING: { color: "bg-blue-50 text-blue-700", icon: RefreshCw },
  PAID: { color: "bg-green-50 text-green-700", icon: CheckCircle },
  CANCELLED: { color: "bg-red-50 text-red-700", icon: XCircle },
};

const TABS = ["ALL", "PENDING", "PROCESSING", "PAID", "CANCELLED"];

const PAYMENT_METHODS = ["bKash", "Nagad", "Rocket", "Bank Transfer", "Other"];

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("PENDING");
  const [page, setPage] = useState(1);
  const limit = 15;

  const load = async () => {
    setLoading(true);
    const res = await getAllWithdrawRequests({
      page,
      limit,
      status: tab === "ALL" ? undefined : tab,
    });
    if (res?.success) {
      setRequests(res.data?.requests ?? []);
      setTotal(res.data?.total ?? 0);
      setSummary(res.data?.summary ?? {});
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [tab, page]);

  const handleStatusUpdate = async (
    publicId: string,
    status: "PROCESSING" | "PAID" | "CANCELLED",
    paidThrough?: string,
  ) => {
    const label =
      status === "PAID"
        ? "Mark as Paid"
        : status === "PROCESSING"
        ? "Mark as Processing"
        : "Cancel";
    if (!confirm(`${label} this request?`)) return;

    const fd = new FormData();
    fd.append(
      "data",
      JSON.stringify({ status, paidThrough: paidThrough ?? undefined }),
    );

    const res = await updateWithdrawRequestStatus(publicId, fd);
    if (res?.success) {
      toast.success(`Request ${status.toLowerCase()}`);
      load();
    } else {
      toast.error((res as any)?.message ?? "Failed");
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-bold text-gray-900">
        Vendor Withdrawals
      </h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["PENDING", "PROCESSING", "PAID", "CANCELLED"].map((s) => {
          const meta = STATUS_META[s];
          const data = summary[s] ?? { count: 0, amount: 0 };
          return (
            <div key={s} className="card p-4">
              <div
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 mb-2",
                  meta.color,
                )}
              >
                <meta.icon size={11} /> {s}
              </div>
              <p className="font-bold text-gray-900">{data.count} requests</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatBDT(data.amount)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
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
            {t === "ALL" ? "All" : t}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-center">
            <Wallet size={48} className="text-gray-200" />
            <p className="text-gray-500">
              No {tab.toLowerCase()} withdrawal requests.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    {[
                      "Vendor",
                      "Amount",
                      "Method / Note",
                      "Status",
                      "Requested",
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
                  {requests.map((r, i) => {
                    const meta = STATUS_META[r.status] ?? STATUS_META.PENDING;
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                      >
                        {/* Vendor */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {r.vendor?.logo ? (
                              <Image
                                src={r.vendor.logo}
                                alt=""
                                className="w-7 h-7 rounded-lg object-cover"
                                width={28}
                                height={28}
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-primary-pale flex items-center justify-center text-primary text-xs font-bold">
                                {r.vendor?.storeName?.[0]}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {r.vendor?.storeName}
                              </p>
                              <p className="text-xs text-gray-400">
                                Due: {formatBDT(r.vendor?.vendorDue ?? 0)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-primary">
                            {formatBDT(r.amount)}
                          </p>
                        </td>

                        {/* Method / Note */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-700">
                            {r.paymentMethod}
                          </p>
                          {r.description && (
                            <p className="text-xs text-gray-400 max-w-[180px] truncate">
                              {r.description}
                            </p>
                          )}
                          {r.paidThrough && (
                            <p className="text-xs text-green-600">
                              Paid via {r.paidThrough}
                            </p>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit",
                              meta.color,
                            )}
                          >
                            <meta.icon size={11} /> {r.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {formatDate(r.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {r.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(r.publicId, "PROCESSING")
                                  }
                                  className="text-xs text-blue-600 hover:underline text-left"
                                >
                                  → Mark Processing
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(r.publicId, "CANCELLED")
                                  }
                                  className="text-xs text-red-500 hover:underline text-left"
                                >
                                  ✕ Cancel
                                </button>
                              </>
                            )}
                            {r.status === "PROCESSING" && (
                              <PayNowButton
                                onPay={(method) =>
                                  handleStatusUpdate(r.publicId, "PAID", method)
                                }
                              />
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}

// Inline pay button with method selection
function PayNowButton({ onPay }: { onPay: (method: string) => void }) {
  const [selecting, setSelecting] = useState(false);
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);

  if (!selecting) {
    return (
      <button
        onClick={() => setSelecting(true)}
        className="text-xs text-green-600 font-semibold hover:underline text-left"
      >
        ✓ Mark as Paid
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-primary bg-white"
      >
        {PAYMENT_METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <div className="flex gap-1.5">
        <button
          onClick={() => onPay(method)}
          className="text-xs bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600"
        >
          Confirm
        </button>
        <button
          onClick={() => setSelecting(false)}
          className="text-xs border border-gray-200 px-2 py-1 rounded-lg text-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
