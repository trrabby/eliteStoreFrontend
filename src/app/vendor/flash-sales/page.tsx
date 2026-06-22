/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Plus,
  Eye,
  Trash2,
  Play,
  Square,
  Clock,
  CheckCircle,
  XCircle,
  Package,
} from "lucide-react";
import {
  getMyFlashSales,
  cancelFlashSale,
  deleteFlashSale,
  activateFlashSale,
  createFlashSale,
} from "@/services/flashSale.service";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Link from "next/link";
import { X } from "lucide-react";
import { FlashSaleItemsModal } from "@/components/shared/FlashSaleModal";

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

/* ── Create Sale Modal ─────────────────────────────────────── */
function CreateSaleModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !start || !end) {
      toast.error("Fill all required fields");
      return;
    }
    if (new Date(end) <= new Date(start)) {
      toast.error("End must be after start");
      return;
    }
    if (new Date(start) <= new Date()) {
      toast.error("Start must be in the future");
      return;
    }

    setSaving(true);
    const fd = new FormData();
    fd.append(
      "data",
      JSON.stringify({
        title,
        description: desc || undefined,
        startsAt: new Date(start).toISOString(),
        endsAt: new Date(end).toISOString(),
      }),
    );
    const res = await createFlashSale(fd);
    if (res?.success) {
      toast.success("Flash sale created!");
      onCreated();
    } else toast.error((res as any)?.message ?? "Failed");
    setSaving(false);
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none " +
    "focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              New Flash Sale
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Add products after creation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mega Weekend Sale"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              placeholder="Optional..."
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Starts At *
              </label>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Ends At *
              </label>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary py-3 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary py-3 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <Zap size={14} />
              )}
              {saving ? "Creating..." : "Create Draft"}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function VendorFlashSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [managing, setManaging] = useState<any | null>(null);
  const limit = 10;

  const load = async () => {
    setLoading(true);
    const res = await getMyFlashSales({
      page,
      limit,
      status: tab === "ALL" ? undefined : tab,
    });
    if (res?.success) {
      setSales(res.data?.sales ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  const handleActivate = async (publicId: string) => {
    if (!confirm("Activate this flash sale? It will go live immediately."))
      return;
    const fd = new FormData();
    fd.append("data", JSON.stringify({ confirm: true }));
    const res = await activateFlashSale(publicId, fd);
    if (res?.success) {
      toast.success("Flash sale is now live! 🎉");
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
    if (!confirm("Delete this draft?")) return;
    const res = await deleteFlashSale(publicId);
    if (res?.success || typeof res === "string") {
      toast.success("Deleted");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  const counts = {
    total: sales.length,
    active: sales.filter((s) => s.status === "ACTIVE").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Flash Sales
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {counts.active} active sale{counts.active !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus size={15} /> New Flash Sale
        </button>
      </div>

      {/* Banner */}
      <div className="bg-linear-to-r from-orange-500 to-primary rounded-2xl p-5 text-white flex items-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Zap size={32} className="fill-white" />
        </motion.div>
        <div>
          <p className="font-semibold">Flash Sales boost visibility by 3x</p>
          <p className="text-xs text-white/80 mt-0.5">
            Create a draft → add your products → activate when ready.
          </p>
        </div>
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

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : sales.length === 0 ? (
        <div className="card p-12 text-center">
          <Zap size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 mb-4">No flash sales yet.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary px-6 py-2.5 text-sm"
          >
            Create First Sale
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sales.map((s, i) => {
            const meta = STATUS_META[s.status] ?? STATUS_META.DRAFT;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 hover:shadow-md transition-shadow"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-400 to-primary
                                    flex items-center justify-center shrink-0"
                    >
                      <Zap size={16} className="text-white fill-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {s.title}
                      </p>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 mt-0.5",
                          meta.color,
                        )}
                      >
                        <meta.icon size={10} /> {meta.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-2xl font-bold text-primary">
                      {s._count?.items ?? 0}
                    </p>
                    <p className="text-xs text-gray-400">items</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-400 space-y-0.5 mb-4">
                  <p>
                    Start:{" "}
                    <span className="text-gray-600">
                      {formatDate(s.startsAt)}
                    </span>
                  </p>
                  <p>
                    End:{" "}
                    <span className="text-gray-600">
                      {formatDate(s.endsAt)}
                    </span>
                  </p>
                </div>

                <div className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setManaging(s)}
                      className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-primary-pale"
                      title="Manage items"
                    >
                      <Package size={13} />
                    </button>
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
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {total > limit && (
        <div className="flex items-center justify-between">
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

      <AnimatePresence>
        {showCreate && (
          <CreateSaleModal
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              load();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {managing && (
          <FlashSaleItemsModal
            sale={managing}
            onClose={() => {
              setManaging(null);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
