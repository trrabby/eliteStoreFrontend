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
  Copy,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
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

function isExpired(d: string) {
  return new Date(d) < new Date();
}

/* ── Reuse the same compact form ─────────────────────────────── */
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
      toast.error("Code, discount and expiry are required");
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
    } else toast.error((res as any)?.message ?? "Failed");
    setSaving(false);
  };

  const inp =
    "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

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
            {coupon ? "Edit" : "Create"} Coupon
          </h3>
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
              Coupon Code *
            </label>
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="SUMMER20"
              className={`${inp} font-mono tracking-widest`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description"
              className={inp}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Type *
              </label>
              <select
                value={form.discountType}
                onChange={(e) => set("discountType", e.target.value)}
                className={`${inp} bg-white`}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat (৳)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Value *
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
                placeholder={form.discountType === "PERCENTAGE" ? "20" : "100"}
                min={0}
                max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                className={inp}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Min Order (৳)
              </label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => set("minOrderAmount", e.target.value)}
                placeholder="Optional"
                min={0}
                className={inp}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Total Uses
              </label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => set("usageLimit", e.target.value)}
                placeholder="∞"
                min={1}
                className={inp}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Starts At
              </label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => set("startsAt", e.target.value)}
                className={inp}
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
                className={inp}
              />
            </div>
          </div>
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
              {saving ? "Saving..." : coupon ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function VendorCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; coupon?: Coupon }>({
    open: false,
  });
  const limit = 20;

  const load = async () => {
    setLoading(true);
    const res = await getAllCoupons({ limit });
    if (res?.success) {
      setCoupons(res.data?.coupons ?? res.data ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (id: number) => {
    const res = await toggleCouponStatus(id);
    if (res?.success) {
      toast.success("Status updated");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Delete "${code}"?`)) return;
    const res = await deleteCoupon(id);
    if (res?.success) {
      toast.success("Deleted");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  const activeCoupons = coupons.filter(
    (c) => c.isActive && !isExpired(c.expiresAt),
  );

  return (
    <div className="space-y-5 container mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Coupons
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {activeCoupons.length} active · {total} total
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus size={15} /> Create Coupon
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-primary-pale border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-gray-700">
          Coupons you create are available to all customers. Share your coupon
          codes through your store page or social channels.
        </p>
      </div>

      {/* Coupon list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="card p-12 text-center">
          <Tag size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 mb-4">
            No coupons yet. Create your first one!
          </p>
          <button
            onClick={() => setModal({ open: true })}
            className="btn-primary px-6 py-2.5 text-sm"
          >
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c, i) => {
            const expired = isExpired(c.expiresAt);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "card p-4 transition-all",
                  expired && "opacity-60",
                )}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {/* Code + discount */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-pale flex items-center justify-center shrink-0">
                      <Tag size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(c.code);
                            toast.success(`Copied: ${c.code}`);
                          }}
                          className="font-mono font-bold text-gray-900 hover:text-primary flex items-center gap-1 group text-sm"
                        >
                          {c.code}{" "}
                          <Copy
                            size={10}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </button>
                        {expired ? (
                          <span className="text-xs bg-red-50 text-red-400 px-2 py-0.5 rounded-full">
                            Expired
                          </span>
                        ) : c.isActive ? (
                          <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {c.discountType === "PERCENTAGE"
                          ? `${c.discountValue}% off`
                          : `৳${c.discountValue} off`}
                        {c.minOrderAmount
                          ? ` · min ${formatBDT(c.minOrderAmount)}`
                          : ""}
                        {" · "}Expires {formatDate(c.expiresAt)}
                      </p>
                    </div>
                  </div>

                  {/* Usage + actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {c.usedCount}
                        <span className="text-gray-400 font-normal text-xs">
                          {c.usageLimit ? ` / ${c.usageLimit}` : " uses"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400">used</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setModal({ open: true, coupon: c })}
                        className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-primary-pale"
                      >
                        <Pencil size={13} />
                      </button>
                      {!expired && (
                        <button
                          onClick={() => handleToggle(c.id)}
                          className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100"
                        >
                          {c.isActive ? (
                            <ToggleRight size={15} className="text-green-500" />
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
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

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
