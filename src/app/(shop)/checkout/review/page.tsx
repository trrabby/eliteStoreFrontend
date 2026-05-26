/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Shield,
  Truck,
  CreditCard,
  MapPin,
  Package,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Home,
  Building,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import {
  selectCheckout,
  setPlacedOrder,
  resetCheckout,
} from "@/store/slices/checkoutSlice";
import { clearCart } from "@/store/slices/cartSlice";
import { useCart } from "@/lib/hooks/useCart";
import { getMyAddresses } from "@/services/user.service";
import { createOrder } from "@/services/order.service";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { formatBDT } from "@/lib/utils/currency";
import type { IAddress } from "@/types/user.types";
import Image from "next/image";

const getAddressIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "home":
      return <Home size={16} />;
    case "office":
    case "work":
      return <Building size={16} />;
    default:
      return <MapPin size={16} />;
  }
};

export default function CheckoutReviewPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const checkout = useAppSelector(selectCheckout);
  const { items, subtotal: cartSubtotal } = useCart();

  const [address, setAddress] = useState<IAddress | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const subtotal = Number(cartSubtotal) || 0;
  const shippingFee = subtotal >= 1000 ? 0 : 60;
  const discount = Number(checkout.couponDiscount) || 0;
  const total = Math.max(0, subtotal + shippingFee - discount);

  const loadAddress = useCallback(async () => {
    if (!checkout.selectedAddressId) return;
    try {
      const res = await getMyAddresses();
      if (res?.success) {
        const addr =
          res.data?.find(
            (a: IAddress) => a.id === checkout.selectedAddressId,
          ) ?? null;
        setAddress(addr);
      }
    } catch {
      toast.error("Failed to load address.");
    } finally {
      setLoading(false);
    }
  }, [checkout.selectedAddressId]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!checkout.selectedAddressId) {
      router.push("/checkout");
      return;
    }
    loadAddress();
  }, [user, checkout.selectedAddressId, router, loadAddress]);

  const handleCreateOrder = async () => {
    if (!address) return;
    setCreating(true);

    try {
      const orderFd = new FormData();
      orderFd.append(
        "data",
        JSON.stringify({
          shippingAddressId: checkout.selectedAddressId,
          couponCode: checkout.couponCode ?? undefined,
          notes: checkout.notes || undefined,
        }),
      );

      const orderRes = await createOrder(orderFd);

      if (!orderRes?.success) {
        toast.error(orderRes?.message ?? "Failed to create order.");
        return;
      }

      const { id: orderId, publicId, orderNumber } = orderRes.data;

      dispatch(
        setPlacedOrder({ orderId, orderPublicId: publicId, orderNumber }),
      );

      // Navigate to payment page
      router.push("/checkout/payment");
    } catch (error) {
      console.error("Create order error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (!user) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container-elite py-6 max-w-2xl">
          <CheckoutProgress />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 rounded-3xl bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container-elite py-6 max-w-2xl">
        <CheckoutProgress />

        <div className="space-y-5">
          {/* Order Items Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-primary/10 p-2">
                    <ShoppingBag size={18} className="text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-gray-900">
                    Order Items
                  </h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {items.map((item, index) => {
                const itemPrice = Number(item.variant.price) || 0;
                const itemTotal = itemPrice * (item.quantity || 0);
                return (
                  <div
                    key={item.variantId}
                    className="flex gap-4 p-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm">
                      <Image
                        src={
                          item.product.images?.[0]?.url ?? "/placeholder.png"
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                            {item.product.name}
                          </h4>
                          {item.variant.name && (
                            <p className="mt-0.5 text-xs text-gray-500">
                              {item.variant.name}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-bold text-primary whitespace-nowrap">
                          {formatBDT(itemTotal)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Package size={12} />
                          <span>Qty: {item.quantity}</span>
                        </div>
                        <div className="h-3 w-px bg-gray-200" />
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>Unit: {formatBDT(itemPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Delivery Address Section */}
          {address && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-primary/10 p-2">
                    <Truck size={18} className="text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-gray-900">
                    Delivery Address
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    {getAddressIcon(address.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-gray-900">
                        {address.fullName}
                      </p>
                      {address.isDefault && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Default
                        </span>
                      )}
                      {address.label && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {address.label}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-700">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city_district}, {address.country}
                        {address.postalCode && ` - ${address.postalCode}`}
                      </p>
                      {address.landmark && (
                        <p className="text-xs text-gray-500">
                          📍 Near {address.landmark}
                        </p>
                      )}
                      <p className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📞</span>
                        <span>{address.phone}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Summary Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
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
                  <span className="font-medium">{formatBDT(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <div className="flex items-center gap-1">
                      <Sparkles size={14} />
                      <span>Coupon ({checkout.couponCode})</span>
                    </div>
                    <span className="font-medium">-{formatBDT(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge</span>
                  {subtotal >= 1000 ? (
                    <span className="font-medium text-green-600 flex items-center gap-1">
                      <CheckCircle2 size={14} /> FREE
                    </span>
                  ) : (
                    <span className="font-medium">
                      {formatBDT(shippingFee)}
                    </span>
                  )}
                </div>

                {checkout.notes && (
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-500 flex items-start gap-1">
                      <span>📝</span>
                      <span>Note: {checkout.notes}</span>
                    </p>
                  </div>
                )}

                <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                  <div>
                    <span className="text-base font-bold text-gray-900">
                      Total Amount
                    </span>
                    <p className="text-xs text-gray-400">
                      Inclusive of all taxes
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">
                      {formatBDT(total)}
                    </span>
                  </div>
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
              <Clock size={16} className="text-primary" />
              <span className="text-xs text-gray-600">Order Confirmation</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/checkout")}
              className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 text-sm font-medium text-gray-600 transition-all hover:border-gray-300"
            >
              <ChevronLeft size={16} />
              Back to Address
            </motion.button>

            <MagneticButton
              onClick={handleCreateOrder}
              disabled={creating}
              strength={0.05}
              className="flex w-full justify-center items-center btn-primary group py-3.5 text-base disabled:opacity-70"
            >
              {creating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                  />
                  <span>Creating Order...</span>
                </>
              ) : (
                <>
                  <span>Create Order & Continue</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </MagneticButton>
          </div>

          <p className="text-center text-xs text-gray-400">
            🔒 By proceeding, you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
}
