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
import { useCart } from "@/lib/hooks/useCart";
import { applyCoupon } from "@/services/coupon.service";
import { getMyAddresses } from "@/services/user.service";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { formatBDT } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import type { IAddress } from "@/types/user.types";
import { AddressFormModal } from "@/components/checkout/AddressFormModal";

const getAddressIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "home":
      return <Home size={16} />;
    case "office":
    case "work":
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
  const { subtotal } = useCart();

  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    checkout.selectedAddressId,
  );
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [focused, setFocused] = useState(false);

  // Notes state
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

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setApplying(true);
    try {
      const fd = new FormData();
      fd.append(
        "data",
        JSON.stringify({
          code: couponInput.trim().toUpperCase(),
          orderAmount: Number(subtotal) || 0,
        }),
      );

      const res = await applyCoupon(fd);

      if (!res?.success) {
        toast.error(res?.message ?? "Invalid or expired coupon.");
        setCouponInput("");
        return;
      }

      const discountAmount =
        Number(res.data?.discountAmount) || Number(res.data?.discount) || 0;

      dispatch(
        applyCouponSuccess({
          code: couponInput.trim().toUpperCase(),
          discount: discountAmount,
          couponId: res.data?.couponId || res.data?.id,
        }),
      );

      toast.success(`Coupon applied! You save ${formatBDT(discountAmount)}`);
      setCouponInput("");
    } catch (error) {
      console.error("Coupon error:", error);
      toast.error("Failed to apply coupon.");
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.info("Coupon removed");
  };

  const handleSaveNotes = () => {
    dispatch(setNotes(notes));
    if (notes) {
      toast.success("Notes saved");
    }
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }

    // Save address to store
    dispatch(setAddress(selectedAddressId));
    // Save notes
    dispatch(setNotes(notes));

    router.push("/checkout/review");
  };

  const subtotalAmount = Number(subtotal) || 0;
  const shippingFee = subtotalAmount >= 1000 ? 0 : 60;
  const discount = Number(checkout.couponDiscount) || 0;
  const total = Math.max(0, subtotalAmount + shippingFee - discount);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container-elite py-6 max-w-2xl">
        <CheckoutProgress />

        <div className="space-y-5">
          {/* Address Selection Section */}
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
                  className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary/20"
                >
                  <Plus size={14} />
                  Add New
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
                    <div key={i} className="animate-pulse">
                      <div className="h-32 rounded-2xl bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">
                    <MapPin
                      size={40}
                      className="text-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No addresses yet
                  </h3>
                  <p className="mb-6 text-sm text-gray-500">
                    Add your first address to continue
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm"
                  >
                    <Plus size={16} />
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="mb-6 grid grid-cols-1 gap-3">
                  {addresses.map((addr, index) => (
                    <motion.button
                      key={addr.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={cn(
                        "group relative w-full overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200",
                        selectedAddressId === addr.id
                          ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/10"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                          selectedAddressId === addr.id
                            ? "border-primary bg-primary"
                            : "border-gray-300 bg-white",
                        )}
                      >
                        {selectedAddressId === addr.id && (
                          <Check size={10} className="text-white" />
                        )}
                      </div>

                      <div className="pr-6">
                        <div className="mb-3 flex items-start gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                              selectedAddressId === addr.id
                                ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200",
                            )}
                          >
                            {getAddressIcon(addr.type)}
                          </div>
                          <div className="flex-1">
                            <div className="mb-1.5 flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {addr.fullName}
                              </span>
                              {addr.isDefault && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                  Default
                                </span>
                              )}
                              {addr.label && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                  {addr.label}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 capitalize">
                              {addr.type?.toLowerCase() || "Other"}
                            </p>
                          </div>
                        </div>

                        <div className="mb-3 space-y-1.5 border-l-2 border-gray-100 pl-3">
                          <div className="flex items-start gap-2">
                            <MapPin
                              size={12}
                              className="mt-0.5 flex-shrink-0 text-gray-400"
                            />
                            <div>
                              <p className="text-sm leading-relaxed text-gray-700">
                                {addr.addressLine1}
                                {addr.addressLine2 && `, ${addr.addressLine2}`}
                              </p>
                              <p className="mt-0.5 text-xs text-gray-500">
                                {addr.city_district}, {addr.country}
                                {addr.postalCode && ` - ${addr.postalCode}`}
                              </p>
                              {addr.landmark && (
                                <p className="mt-0.5 text-xs text-gray-400">
                                  📍 Near {addr.landmark}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">📞</span>
                            <span className="text-sm font-medium text-gray-700">
                              {addr.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Coupon Section */}
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
                  Apply Promo Code
                </h3>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Save more with exclusive coupons
              </p>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {checkout.couponCode ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-4"
                  >
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
                          You save {formatBDT(discount)}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="rounded-lg p-2 text-red-400 transition-all hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
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
                            "w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition-all uppercase tracking-wider",
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
                          "Apply"
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      🎁 Enter a valid coupon code to get instant discount
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Order Notes Section */}
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
              <p className="mt-1 text-xs text-gray-500">
                Any special instructions for delivery?
              </p>
            </div>

            <div className="p-6">
              <textarea
                value={notes}
                onChange={(e) => setNotesState(e.target.value)}
                onBlur={handleSaveNotes}
                placeholder="e.g., Leave at the front door, Call before delivery, etc."
                rows={3}
                className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm outline-none transition-all focus:border-primary/50 focus:bg-white focus:shadow-md"
              />
              <p className="mt-2 text-xs text-gray-400">
                💡 You can add delivery instructions here
              </p>
            </div>
          </motion.div>

          {/* Order Summary Preview */}
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
                      <span>Coupon discount</span>
                    </div>
                    <span className="font-medium">-{formatBDT(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge</span>
                  {subtotalAmount >= 1000 ? (
                    <span className="font-medium text-green-600 flex items-center gap-1">
                      FREE
                    </span>
                  ) : (
                    <span className="font-medium">
                      {formatBDT(shippingFee)}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
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

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-green-600" />
              <span className="text-xs text-gray-600">Secure Transaction</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-primary" />
              <span className="text-xs text-gray-600">Fast Delivery</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Package size={16} className="text-blue-600" />
              <span className="text-xs text-gray-600">Easy Returns</span>
            </div>
          </div>

          {/* Continue Button */}
          <div className="pt-2">
            <MagneticButton
              onClick={handleContinue}
              disabled={!selectedAddressId}
              strength={0.25}
              className={cn(
                "w-full py-3.5 flex items-center justify-center gap-2 transition-all duration-200",
                "btn-primary disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              <span>Review Order</span>
              <ChevronRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </MagneticButton>

            {!selectedAddressId && addresses.length > 0 && (
              <p className="mt-3 text-center text-xs text-amber-600">
                Please select an address to continue
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
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
