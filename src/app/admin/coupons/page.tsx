/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Plus,
  X,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
} from "lucide-react";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from "@/services/coupon.service";
import { formatDate } from "@/lib/utils/date";
import { formatBDT } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

type Coupon = {
  id: number;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
};

const TABS = ["ALL", "ACTIVE", "INACTIVE", "EXPIRED"];

function isExpired(expiresAt: string) {
  return new Date(expiresAt) < new Date();
}

/* ── Coupon Form Modal ─────────────────────────────────────── */
function CouponModal({
  coupon,
  onClose,
  onSaved,
}: {
  coupon?: Coupon;
  onClose: () => void;
  onSaved: () => void;
}) {
  const today = new Date().toISOString().slice(0, 16);

  const [form, setForm] = useState({
    code: coupon?.code ?? "",
    description: coupon?.description ?? "",
    discountType: (coupon?.discountType as string) ?? "PERCENTAGE",
    discountValue: String(coupon?.discountValue ?? ""),
    minOrderAmount: String(coupon?.minOrderAmount ?? ""),
    maxDiscount: String(coupon?.maxDiscount ?? ""),
    usageLimit: String(coupon?.usageLimit ?? ""),
    perUserLimit: String(coupon?.perUserLimit ?? "1"),
    startsAt: coupon
      ? new Date(coupon.startsAt).toISOString().slice(0, 16)
      : today,
    expiresAt: coupon
      ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
      : "",
    isActive: coupon?.isActive ?? true,
  });

  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discountValue || !form.expiresAt) {
      toast.error("Code, discount value and expiry are required");
      return;
    }
    setSaving(true);

    const payload: any = {
      code: form.code.toUpperCase().trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      perUserLimit: Number(form.perUserLimit) || 1,
      startsAt: new Date(form.startsAt).toISOString(),
      expiresAt: new Date(form.expiresAt).toISOString(),
      isActive: form.isActive,
    };
    if (form.description) payload.description = form.description;
    if (form.minOrderAmount)
      payload.minOrderAmount = Number(form.minOrderAmount);
    if (form.maxDiscount) payload.maxDiscount = Number(form.maxDiscount);
    if (form.usageLimit) payload.usageLimit = Number(form.usageLimit);

    const fd = new FormData();
    fd.append("data", JSON.stringify(payload));

    const res = coupon
      ? await updateCoupon(coupon.id, fd)
      : await createCoupon(fd);

    if (res?.success) {
      toast.success(coupon ? "Updated!" : "Coupon created!");
      onSaved();
    } else {
      toast.error((res as any)?.message ?? "Failed");
    }
    setSaving(false);
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none " +
    "focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

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
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-lg bg-white rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 text-lg">
            {coupon ? "Edit Coupon" : "Create Coupon"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Coupon Code *
            </label>
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="e.g. SAVE20"
              className={`${inputCls} font-mono tracking-widest`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="e.g. Save 20% on first order"
              className={inputCls}
            />
          </div>

          {/* Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Discount Type *
              </label>
              <select
                value={form.discountType}
                onChange={(e) => set("discountType", e.target.value)}
                className={`${inputCls} bg-white`}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (৳)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Value * {form.discountType === "PERCENTAGE" ? "(%)" : "(৳)"}
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
                placeholder={form.discountType === "PERCENTAGE" ? "20" : "100"}
                min={0}
                max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                className={inputCls}
              />
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Min Order (৳)
              </label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => set("minOrderAmount", e.target.value)}
                placeholder="500"
                min={0}
                className={inputCls}
              />
            </div>
            {form.discountType === "PERCENTAGE" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Max Discount (৳)
                </label>
                <input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) => set("maxDiscount", e.target.value)}
                  placeholder="200"
                  min={0}
                  className={inputCls}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Total Usage Limit
              </label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => set("usageLimit", e.target.value)}
                placeholder="∞ unlimited"
                min={1}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Per User Limit
              </label>
              <input
                type="number"
                value={form.perUserLimit}
                onChange={(e) => set("perUserLimit", e.target.value)}
                placeholder="1"
                min={1}
                className={inputCls}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Starts At *
              </label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => set("startsAt", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Expires At *
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => set("expiresAt", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set("isActive", !form.isActive)}
              className={cn(
                "w-10 h-5 rounded-full relative transition-colors",
                form.isActive ? "bg-primary" : "bg-gray-300",
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                  form.isActive ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </div>
            <span className="text-sm text-gray-700">Active</span>
          </label>

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
              className="flex-1 btn-primary py-3 text-sm disabled:opacity-60"
            >
              {saving ? "Saving..." : coupon ? "Save Changes" : "Create Coupon"}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ open: boolean; coupon?: Coupon }>({
    open: false,
  });
  const [search, setSearch] = useState("");
  const limit = 20;

  const load = async () => {
    setLoading(true);
    const params: any = { page, limit };
    if (tab === "ACTIVE") {
      params.isActive = true;
      params.isExpired = false;
    }
    if (tab === "INACTIVE") {
      params.isActive = false;
    }
    if (tab === "EXPIRED") {
      params.isExpired = true;
    }
    if (search) params.search = search;

    const res = await getAllCoupons(params);
    if (res?.success) {
      setCoupons(res.data?.coupons ?? res.data ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [tab, page]);

  const handleToggle = async (id: number) => {
    const res = await toggleCouponStatus(id);
    if (res?.success) {
      toast.success("Status updated");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    const res = await deleteCoupon(id);
    if (res?.success) {
      toast.success("Deleted");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Coupons
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">{total} coupons total</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus size={15} /> Create Coupon
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search code or description..."
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Tag size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500">No coupons found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    {[
                      "Code",
                      "Discount",
                      "Usage",
                      "Period",
                      "Status",
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
                  {coupons.map((c, i) => {
                    const expired = isExpired(c.expiresAt);
                    return (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                      >
                        {/* Code */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-primary-pale flex items-center justify-center">
                              <Tag size={13} className="text-primary" />
                            </div>
                            <div>
                              <button
                                onClick={() => handleCopyCode(c.code)}
                                className="font-mono font-bold text-sm text-gray-900 hover:text-primary
                                           flex items-center gap-1 group"
                              >
                                {c.code}
                                <Copy
                                  size={10}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                              </button>
                              {c.description && (
                                <p className="text-xs text-gray-400 max-w-[140px] truncate">
                                  {c.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Discount */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-primary">
                            {c.discountType === "PERCENTAGE"
                              ? `${c.discountValue}%`
                              : formatBDT(c.discountValue)}
                          </p>
                          {c.minOrderAmount && (
                            <p className="text-xs text-gray-400">
                              Min {formatBDT(c.minOrderAmount)}
                            </p>
                          )}
                          {c.maxDiscount && (
                            <p className="text-xs text-gray-400">
                              Cap {formatBDT(c.maxDiscount)}
                            </p>
                          )}
                        </td>

                        {/* Usage */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">
                            {c.usedCount}
                            <span className="text-gray-400 font-normal">
                              {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400">
                            {c.perUserLimit}x per user
                          </p>
                        </td>

                        {/* Period */}
                        <td className="px-4 py-3 text-xs text-gray-500">
                          <p>{formatDate(c.startsAt)}</p>
                          <p
                            className={
                              expired ? "text-red-400" : "text-gray-400"
                            }
                          >
                            → {formatDate(c.expiresAt)}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {expired ? (
                            <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <XCircle size={10} /> Expired
                            </span>
                          ) : c.isActive ? (
                            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <CheckCircle size={10} /> Active
                            </span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <Clock size={10} /> Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                setModal({ open: true, coupon: c })
                              }
                              className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-primary-pale"
                            >
                              <Pencil size={13} />
                            </button>
                            {!expired && (
                              <button
                                onClick={() => handleToggle(c.id)}
                                className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-primary-pale"
                              >
                                {c.isActive ? (
                                  <ToggleRight
                                    size={15}
                                    className="text-green-500"
                                  />
                                ) : (
                                  <ToggleLeft size={15} />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(c.id, c.code)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 size={13} />
                            </button>
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
                <span className="text-xs text-gray-500">{total} coupons</span>
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

      <AnimatePresence>
        {modal.open && (
          <CouponModal
            coupon={modal.coupon}
            onClose={() => setModal({ open: false })}
            onSaved={() => {
              setModal({ open: false });
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
