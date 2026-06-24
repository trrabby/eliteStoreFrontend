/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MapPin,
  Check,
  ChevronRight,
  Home,
  Building,
  Package,
  Tag,
  X,
  Sparkles,
  Gift,
  MessageSquare,
  Shield,
  Truck,
  CreditCard,
  Store,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import {
  selectCheckout,
  setAddress,
  applyCouponSuccess,
  removeCoupon,
  setNotes,
} from "@/store/slices/checkoutSlice";
import { useCartDisplay } from "@/lib/hooks/useCartDisplay";
import { getCouponEligibility } from "@/services/coupon.service";
import { getMyAddresses } from "@/services/user.service";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { AddressFormModal } from "@/components/checkout/AddressFormModal";
import { formatBDT } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import { computeVendorShipping } from "@/lib/utils/cart";
import { getBaseShippingRate } from "@/lib/utils/shipping";
import type { IAddress } from "@/types/user.types";

const FREE_SHIPPING_THRESHOLD = 4000;

const getAddressIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "home":
      return <Home size={16} />;
    case "office":
      return <Building size={16} />;
    default:
      return <Package size={16} />;
  }
};

export default function CheckoutAddressPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const checkout = useAppSelector(selectCheckout);

  const { displayItems, subtotal } = useCartDisplay();
  const defaultAddress = user?.defaultAddress;
  const baseRate = user ? getBaseShippingRate(defaultAddress) : 130;
  const { totalShipping, vendorCount } = computeVendorShipping(
    displayItems,
    baseRate,
    FREE_SHIPPING_THRESHOLD,
  );

  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    checkout.selectedAddressId,
  );
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  /* ── Coupon ── */
  const [couponInput, setCouponInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [focused, setFocused] = useState(false);
  const [eligibility, setEligibility] = useState<any | null>(null);

  /* ── Notes ── */
  const [notes, setNotesState] = useState(checkout.notes ?? "");

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    setLoading(true);
    const res = await getMyAddresses();
    if (res?.success) {
      const list = res.data ?? [];
      setAddresses(list);
      if (!selectedAddressId) {
        const def = list.find((a: IAddress) => a.isDefault);
        if (def) setSelectedAddressId(def.id);
      }
    }
    setLoading(false);
  };

  /* ── Coupon eligibility check ── */
  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }

    setApplying(true);
    try {
      const res = await getCouponEligibility(code);

      if (!res?.success) {
        toast.error((res as any)?.message ?? "Invalid or expired coupon.");
        setCouponInput("");
        return;
      }

      const data = res.data;

      if (!data?.eligible) {
        toast.error(data?.message ?? "You are not eligible for this coupon.");
        setCouponInput("");
        return;
      }

      setEligibility(data);
      dispatch(
        applyCouponSuccess({
          code,
          discount: Number(data.totalDiscount) || 0,
          // couponId unknown at this stage — resolved on order creation
        }),
      );

      toast.success(
        data.message ||
          `Coupon applied! You save ${formatBDT(data.totalDiscount)}`,
      );
      setCouponInput("");
    } catch {
      toast.error("Failed to check coupon eligibility.");
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setEligibility(null);
    toast.info("Coupon removed");
  };

  const handleSaveNotes = () => {
    dispatch(setNotes(notes));
    if (notes) toast.success("Notes saved");
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }
    dispatch(setAddress(selectedAddressId));
    dispatch(setNotes(notes));
    router.push("/checkout/review");
  };

  const subtotalAmount = Number(subtotal) || 0;
  const discount = Number(checkout.couponDiscount) || 0;
  const total = Math.max(0, subtotalAmount + totalShipping - discount);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container-elite py-6 max-w-2xl">
        <CheckoutProgress />

        <div className="space-y-5">
          {/* ── Address Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-primary/10 p-2">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-gray-900">
                    Delivery Address
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-primary/10
                             px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-all"
                >
                  <Plus size={14} /> Add New
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Choose where you want your order delivered
              </p>
            </div>

            <div className="p-6 pt-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse h-32 rounded-2xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <div
                  className="flex min-h-[200px] flex-col items-center justify-center
                                rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center"
                >
                  <MapPin
                    size={40}
                    className="text-primary/30 mb-4"
                    strokeWidth={1.5}
                  />
                  <h3 className="mb-2 font-semibold text-gray-900">
                    No addresses yet
                  </h3>
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary px-6 py-2.5 text-sm mt-3"
                  >
                    <Plus size={16} className="inline mr-1" />
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="mb-2 grid grid-cols-1 gap-3">
                  {addresses.map((addr, i) => (
                    <motion.button
                      key={addr.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={cn(
                        "group relative w-full overflow-hidden rounded-2xl border-2 p-4 text-left transition-all",
                        selectedAddressId === addr.id
                          ? "border-primary/50 bg-primary/5 shadow-md"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                          selectedAddressId === addr.id
                            ? "border-primary bg-primary"
                            : "border-gray-300",
                        )}
                      >
                        {selectedAddressId === addr.id && (
                          <Check size={10} className="text-white" />
                        )}
                      </div>

                      <div className="flex items-start gap-3 pr-6">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                            selectedAddressId === addr.id
                              ? "bg-gradient-to-br from-primary to-primary/80 text-white"
                              : "bg-gray-100 text-gray-600",
                          )}
                        >
                          {getAddressIcon(addr.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {addr.fullName}
                            </span>
                            {addr.isDefault && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                Default
                              </span>
                            )}
                            {addr.label && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                {addr.label}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {addr.city_district}, {addr.country}
                            {addr.postalCode && ` - ${addr.postalCode}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            📞 {addr.phone}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Coupon Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-amber-50 p-2">
                  <Tag size={18} className="text-amber-600" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900">
                  Promo Code
                </h3>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Eligible coupons are verified against your cart
              </p>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {checkout.couponCode ? (
                  /* ── Applied coupon ── */
                  <motion.div
                    key="applied"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-3"
                  >
                    {/* Applied banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                      <div className="absolute right-0 top-0 opacity-10">
                        <Gift size={80} />
                      </div>
                      <div className="relative flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-green-600" />
                            <p className="text-sm font-bold text-green-700 uppercase">
                              {checkout.couponCode}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-green-600">
                            You save {formatBDT(checkout.couponDiscount)}
                          </p>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Vendor-level breakdown */}
                    {eligibility?.details && eligibility.details.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500">
                          Discount breakdown by vendor:
                        </p>
                        {eligibility.details.map(
                          (d: any, i: number) =>
                            d.couponDiscount > 0 && (
                              <div
                                key={i}
                                className="flex items-center justify-between
                                                     bg-gray-50 rounded-xl px-3 py-2 text-xs"
                              >
                                <div className="flex items-center gap-1.5">
                                  <Store size={12} className="text-primary" />
                                  <span className="text-gray-700 font-medium">
                                    {d.vendorName ?? "Store"}
                                  </span>
                                </div>
                                <span className="text-green-600 font-semibold">
                                  -{formatBDT(d.couponDiscount)}
                                </span>
                              </div>
                            ),
                        )}
                      </div>
                    )}

                    {/* Scope notice for vendor coupon */}
                    {eligibility?.details?.[0]?.note?.includes("vendor") && (
                      <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700">
                        <AlertCircle size={12} className="mt-0.5 shrink-0" />
                        <span>{eligibility.details[0].note}</span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* ── Input ── */
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          value={couponInput}
                          onChange={(e) =>
                            setCouponInput(e.target.value.toUpperCase())
                          }
                          onFocus={() => setFocused(true)}
                          onBlur={() => setFocused(false)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleApplyCoupon()
                          }
                          placeholder="Enter coupon code"
                          className={cn(
                            "w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition-all",
                            "uppercase tracking-wider",
                            focused
                              ? "border-primary/50 bg-white shadow-md"
                              : "border-gray-200 bg-gray-50/50 hover:border-gray-300",
                          )}
                        />
                        {couponInput && (
                          <button
                            onClick={() => setCouponInput("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applying || !couponInput.trim()}
                        className="btn-primary px-6 py-3 text-sm disabled:opacity-50"
                      >
                        {applying ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          "Check"
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      🎁 Eligibility is checked against your actual cart items
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Notes Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-purple-50 p-2">
                  <MessageSquare size={18} className="text-purple-600" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900">
                  Order Notes (Optional)
                </h3>
              </div>
            </div>
            <div className="p-6">
              <textarea
                value={notes}
                onChange={(e) => setNotesState(e.target.value)}
                onBlur={handleSaveNotes}
                placeholder="e.g., Leave at the front door, Call before delivery..."
                rows={3}
                className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm outline-none
                           resize-none transition-all focus:border-primary/50 focus:shadow-md"
              />
            </div>
          </motion.div>

          {/* ── Order Summary ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-primary/10 p-2">
                  <CreditCard size={18} className="text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900">
                  Order Summary
                </h3>
              </div>
            </div>
            <div className="p-6">
              {vendorCount > 1 && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 p-2.5 text-xs text-blue-700">
                  <Store size={14} className="shrink-0" />
                  Items from {vendorCount} vendors — shipping applied per vendor
                </div>
              )}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {formatBDT(subtotalAmount)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <div className="flex items-center gap-1">
                      <Sparkles size={14} />
                      <span>Coupon</span>
                    </div>
                    <span className="font-medium">-{formatBDT(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge</span>
                  {totalShipping === 0 ? (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle2 size={13} /> FREE
                    </span>
                  ) : (
                    <span className="font-medium">
                      {formatBDT(totalShipping)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-4 mt-4">
                  <span className="text-base font-bold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {formatBDT(total)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Trust badges ── */}
          <div className="flex items-center justify-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
            {[
              {
                icon: Shield,
                label: "Secure Transaction",
                color: "text-green-600",
              },
              { icon: Truck, label: "Fast Delivery", color: "text-primary" },
              { icon: Package, label: "Easy Returns", color: "text-blue-600" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={16} className={color} />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>

          {/* ── Continue button ── */}
          <div className="pt-2">
            <MagneticButton
              onClick={handleContinue}
              disabled={!selectedAddressId}
              strength={0.25}
              className={cn(
                "w-full py-3.5 flex items-center justify-center gap-2",
                "btn-primary disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              <span>Review Order</span>
              <ChevronRight size={16} />
            </MagneticButton>
          </div>
        </div>
      </div>

      {showModal && (
        <AddressFormModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            loadAddresses();
          }}
        />
      )}
    </div>
  );
}
