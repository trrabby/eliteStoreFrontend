/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Plus,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Play,
  Square,
  RefreshCw,
  BarChart2,
} from "lucide-react";
import {
  getAdminFlashSales,
  endExpiredFlashSales,
  cancelFlashSale,
  deleteFlashSale,
  getFlashSaleStats,
  activateFlashSale,
} from "@/services/flashSale.service";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

const STATUS_META: Record<string, { color: string; icon: any; label: string }> =
  {
    DRAFT: { color: "bg-gray-100 text-gray-600", icon: Clock, label: "Draft" },
    ACTIVE: {
      color: "bg-green-50 text-green-700",
      icon: CheckCircle,
      label: "Active",
    },
    ENDED: {
      color: "bg-blue-50 text-blue-600",
      icon: CheckCircle,
      label: "Ended",
    },
    CANCELLED: {
      color: "bg-red-50 text-red-600",
      icon: XCircle,
      label: "Cancelled",
    },
  };

const TABS = ["ALL", "DRAFT", "ACTIVE", "ENDED", "CANCELLED"];

export default function AdminFlashSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 15;

  const load = async () => {
    setLoading(true);
    const [salesRes, statsRes] = await Promise.all([
      getAdminFlashSales({
        page,
        limit,
        status: tab === "ALL" ? undefined : tab,
      }),
      getFlashSaleStats(),
    ]);
    if (salesRes?.success) {
      setSales(salesRes.data?.sales ?? []);
      setTotal(salesRes.data?.total ?? 0);
    }
    if (statsRes?.success) setStats(statsRes.data ?? {});
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [tab, page]);

  const handleEndExpired = async () => {
    const res = await endExpiredFlashSales();
    if (res?.success) {
      toast.success(`${res.data?.endedCount ?? 0} expired sale(s) ended`);
      load();
    }
  };

  const handleActivate = async (publicId: string) => {
    if (!confirm("Activate this flash sale?")) return;
    const fd = new FormData();
    fd.append("data", JSON.stringify({ confirm: true }));
    const res = await activateFlashSale(publicId, fd);
    if (res?.success) {
      toast.success("Flash sale activated!");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  const handleCancel = async (publicId: string) => {
    if (!confirm("Cancel this flash sale?")) return;
    const res = await cancelFlashSale(publicId);
    if (res?.success || typeof res === "string") {
      toast.success("Cancelled");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm("Delete this draft flash sale?")) return;
    const res = await deleteFlashSale(publicId);
    if (res?.success || typeof res === "string") {
      toast.success("Deleted");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Flash Sales
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {stats.active ?? 0} active · {stats.total ?? 0} total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEndExpired}
            className="btn-secondary px-3 py-2.5 text-sm flex items-center gap-2"
          >
            <RefreshCw size={14} /> End Expired
          </button>
          <Link
            href="/admin/flash-sales/create"
            className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <Plus size={15} /> New Sale
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total ?? 0, color: "border-gray-300" },
          {
            label: "Active",
            value: stats.active ?? 0,
            color: "border-green-400",
          },
          { label: "Ended", value: stats.ended ?? 0, color: "border-blue-400" },
          {
            label: "Items Sold",
            value: stats.totalSold ?? 0,
            color: "border-primary",
          },
        ].map((s) => (
          <div key={s.label} className={cn("card p-4 border-l-4", s.color)}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="font-display text-2xl font-bold text-gray-900 mt-1">
              {s.value}
            </p>
          </div>
        ))}
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

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : sales.length === 0 ? (
          <div className="p-12 text-center">
            <Zap size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500">No flash sales found.</p>
            <Link
              href="/admin/flash-sales/create"
              className="btn-primary px-6 py-2.5 text-sm mt-4 inline-block"
            >
              Create First Sale
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    {[
                      "Title",
                      "Vendor",
                      "Items",
                      "Status",
                      "Period",
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
                  {sales.map((s, i) => {
                    const meta = STATUS_META[s.status] ?? STATUS_META.DRAFT;
                    return (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {s.banner ? (
                              <Image
                                src={s.banner}
                                alt=""
                                className="w-10 h-7 rounded-lg object-cover shrink-0"
                                height={28}
                                width={40}
                              />
                            ) : (
                              <div className="w-10 h-7 rounded-lg bg-linear-to-r from-orange-400 to-primary shrink-0 flex items-center justify-center">
                                <Zap size={12} className="text-white" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {s.title}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">
                                {s.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-600">
                          {s.vendor?.storeName ?? (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {s._count?.items ?? 0}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">
                            items
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit",
                              meta.color,
                            )}
                          >
                            <meta.icon size={10} /> {meta.label}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-500">
                          <p>{formatDate(s.startsAt)}</p>
                          <p className="text-gray-300">
                            → {formatDate(s.endsAt)}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/flash-sales/${s.slug}`}
                              className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-primary-pale"
                            >
                              <Eye size={13} />
                            </Link>
                            {s.status === "DRAFT" && (
                              <>
                                <button
                                  onClick={() => handleActivate(s.publicId)}
                                  className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                                >
                                  <Play size={13} />
                                </button>
                                <button
                                  onClick={() => handleDelete(s.publicId)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                            {s.status === "ACTIVE" && (
                              <button
                                onClick={() => handleCancel(s.publicId)}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                              >
                                <Square size={13} />
                              </button>
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
                <span className="text-xs text-gray-500">{total} total</span>
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
