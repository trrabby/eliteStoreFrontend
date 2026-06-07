/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
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
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
};

function CouponModal({
  coupon,
  onClose,
  onSaved,
}: {
  coupon?: Coupon;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    code: coupon?.code ?? "",
    discountType: coupon?.discountType ?? "PERCENTAGE",
    discountValue: coupon?.discountValue ?? "",
    minOrderAmount: coupon?.minOrderAmount ?? "",
    maxDiscount: coupon?.maxDiscount ?? "",
    usageLimit: coupon?.usageLimit ?? "",
    expiresAt: coupon?.expiresAt?.slice(0, 10) ?? "",
    isActive: coupon?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) {
      toast.error("Code and discount required");
      return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append(
      "data",
      JSON.stringify({
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount
          ? Number(form.minOrderAmount)
          : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        expiresAt: form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : undefined,
        isActive: form.isActive,
      }),
    );
    const res = coupon
      ? await updateCoupon(coupon.id, fd)
      : await createCoupon(fd);
    if (res?.success) {
      toast.success(coupon ? "Updated!" : "Coupon created!");
      onSaved();
    } else toast.error((res as any)?.message ?? "Failed");
    setSaving(false);
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-lg bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 text-lg">
            {coupon ? "Edit" : "New"} Coupon
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Code *
              </label>
              <input
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="SAVE20"
                className={`${inputCls} font-mono tracking-wider`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={form.discountType}
                onChange={(e) => set("discountType", e.target.value)}
                className={inputCls}
              >
                <option value="PERCENTAGE">Percentage %</option>
                <option value="FLAT">Flat ৳</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Value * {form.discountType === "PERCENTAGE" ? "(%)" : "(৳)"}
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
                placeholder={form.discountType === "PERCENTAGE" ? "20" : "100"}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Min Order (৳)
              </label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => set("minOrderAmount", e.target.value)}
                placeholder="500"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Max Discount (৳)
              </label>
              <input
                type="number"
                value={form.maxDiscount}
                onChange={(e) => set("maxDiscount", e.target.value)}
                placeholder="200"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => set("usageLimit", e.target.value)}
                placeholder="100"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Expires At
            </label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => set("expiresAt", e.target.value)}
              className={inputCls}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-gray-700">Active immediately</span>
          </label>

          <div className="flex gap-3 pt-3">
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

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; coupon?: Coupon }>({
    open: false,
  });
  const [page, setPage] = useState(1);
  const limit = 15;

  const load = async () => {
    setLoading(true);
    const res = await getAllCoupons({ page, limit });
    if (res?.success) {
      setCoupons(res.data?.coupons ?? res.data ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [page]);

  const handleToggle = async (id: number) => {
    const res = await toggleCouponStatus(id);
    if (res?.success) {
      toast.success("Status toggled");
      load();
    } else toast.error("Failed");
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    const res = await deleteCoupon(id);
    if (res?.success || res === "") {
      toast.success("Deleted");
      load();
    } else toast.error("Failed");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Coupons
        </h2>
        <button
          onClick={() => setModal({ open: true })}
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus size={15} /> New Coupon
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {[
                    "Code",
                    "Type",
                    "Value",
                    "Min Order",
                    "Used/Limit",
                    "Expires",
                    "Active",
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
                {coupons.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3 font-mono text-sm font-bold text-gray-900">
                      {c.code}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {c.discountType}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary">
                      {c.discountType === "PERCENTAGE"
                        ? `${c.discountValue}%`
                        : formatBDT(c.discountValue)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {c.minOrderAmount ? formatBDT(c.minOrderAmount) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {c.usedCount} / {c.usageLimit ?? "∞"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {c.expiresAt ? formatDate(c.expiresAt) : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(c.id)}
                        className={cn(
                          "transition-colors",
                          c.isActive ? "text-green-500" : "text-gray-300",
                        )}
                      >
                        {c.isActive ? (
                          <ToggleRight size={22} />
                        ) : (
                          <ToggleLeft size={22} />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setModal({ open: true, coupon: c })}
                          className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-primary-pale"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
