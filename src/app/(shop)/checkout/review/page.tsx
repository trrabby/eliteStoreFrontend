/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Store,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import {
  selectCheckout,
  setPlacedOrders,
  resetCheckout,
} from "@/store/slices/checkoutSlice";
import { useCartDisplay } from "@/lib/hooks/useCartDisplay";
import { getMyAddresses } from "@/services/user.service";
import { createOrder } from "@/services/order.service";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { formatBDT } from "@/lib/utils/currency";
import { computeVendorShipping } from "@/lib/utils/cart";
import { getBaseShippingRate } from "@/lib/utils/shipping";
import type { IAddress } from "@/types/user.types";
import { cn } from "@/lib/utils/cn";

const FREE_SHIPPING_THRESHOLD = 4000;

const getAddressIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "home":
      return <Home size={16} />;
    case "office":
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

  /* ── Cart with proper pricing ── */
  const {
    displayItems,
    subtotal: cartSubtotal,
    vendorGroups,
    loading: cartLoading,
  } = useCartDisplay();

  /* ── Shipping ── */
  const defaultAddress = user?.defaultAddress;
  const baseRate = user ? getBaseShippingRate(defaultAddress) : 130;
  const { totalShipping, vendorCount } = computeVendorShipping(
    displayItems,
    baseRate,
    FREE_SHIPPING_THRESHOLD,
  );

  const [address, setAddress] = useState<IAddress | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const subtotalAmount = Number(cartSubtotal) || 0;
  const discount = Number(checkout.couponDiscount) || 0;
  const total = Math.max(0, subtotalAmount + totalShipping - discount);

  const loadAddress = useCallback(async () => {
    if (!checkout.selectedAddressId) return;
    try {
      const res = await getMyAddresses();
      if (res?.success) {
        const found =
          res.data?.find(
            (a: IAddress) => a.id === checkout.selectedAddressId,
          ) ?? null;
        setAddress(found);
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
          shippingFeeFromClient: String(Math.round(totalShipping)), // pass computed fee
          couponCode: checkout.couponCode ?? undefined,
          notes: checkout.notes || undefined,
        }),
      );

      const orderRes = await createOrder(orderFd);

      if (!orderRes?.success) {
        toast.error(orderRes?.message ?? "Failed to create order.");
        return;
      }

      /* ── Handle multi-vendor response ── */
      const data = orderRes.data;
      // createOrder returns { orders: [...], orderCount, ... }
      const orders: { id: number; publicId: string; orderNumber: string }[] =
        Array.isArray(data?.orders)
          ? data.orders.map((o: any) => ({
              id: o.id,
              publicId: o.publicId,
              orderNumber: o.orderNumber,
            }))
          : [
              {
                id: data?.id,
                publicId: data?.publicId,
                orderNumber: data?.orderNumber,
              },
            ];

      dispatch(setPlacedOrders({ orders }));

      const count = orders.length;
      toast.success(
        count === 1
          ? "Order created! Choose your payment method."
          : `${count} orders created across ${count} vendors!`,
      );

      router.push("/checkout/payment");
    } catch (error) {
      console.error("Create order error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (!user) return null;

  if (loading || cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container-elite py-6 max-w-2xl">
          <CheckoutProgress />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse h-48 rounded-3xl bg-gray-100"
              />
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
          {/* ── Order Items (grouped by vendor) ── */}
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
                  {displayItems.length}{" "}
                  {displayItems.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            {/* Vendor-grouped items */}
            <div className="max-h-80 overflow-y-auto">
              {vendorGroups.map((group) => (
                <div key={group.vendorId}>
                  {/* Vendor header */}
                  <div
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/70
                                   border-b border-gray-100 text-xs font-medium text-gray-600"
                  >
                    <Store size={13} className="text-primary shrink-0" />
                    <span className="font-semibold">{group.vendorName}</span>
                    <span className="ml-auto text-gray-400">
                      {group.items.length} item
                      {group.items.length !== 1 ? "s" : ""}
                      {" · "}
                      {formatBDT(group.subtotal)}
                    </span>
                  </div>

                  {group.items.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex gap-4 p-4 hover:bg-gray-50/50 transition-colors
                                 border-b border-gray-50 last:border-0"
                    >
                      {/* Image */}
                      <div
                        className="relative h-20 w-20 flex-shrink-0 overflow-hidden
                                      rounded-xl bg-gray-100 shadow-sm"
                      >
                        <Image
                          src={item.imageUrl || "/placeholder.png"}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                        {item.flashSaleLabel && (
                          <div
                            className="absolute top-0 left-0 bg-orange-500 text-white
                                          text-[9px] font-bold px-1 py-0.5 rounded-br-lg
                                          flex items-center gap-0.5"
                          >
                            <Zap size={7} className="fill-white" />
                            Flash
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                              {item.productName}
                            </h4>
                            {item.variantName && (
                              <p className="mt-0.5 text-xs text-gray-500">
                                {item.variantName}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold text-primary whitespace-nowrap">
                              {formatBDT(item.salePrice * item.quantity)}
                            </span>
                            {item.hasDiscount && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatBDT(item.basePrice * item.quantity)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Package size={11} />
                            <span>Qty: {item.quantity}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatBDT(item.salePrice)} each
                          </div>
                          {item.totalDiscountPercent > 0 && (
                            <span
                              className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                item.flashSaleLabel
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-green-100 text-green-600",
                              )}
                            >
                              -{item.totalDiscountPercent}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Delivery Address ── */}
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
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
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city_district}, {address.country}
                      {address.postalCode && ` - ${address.postalCode}`}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      📞 {address.phone}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Order Summary ── */}
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
              {vendorCount > 1 && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 p-2.5 text-xs text-blue-700">
                  <Store size={14} className="shrink-0" />
                  {vendorCount} separate vendor orders will be created
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
                      <span>Coupon ({checkout.couponCode})</span>
                    </div>
                    <span className="font-medium">-{formatBDT(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge</span>
                  {totalShipping === 0 ? (
                    <span className="font-medium text-green-600 flex items-center gap-1">
                      <CheckCircle2 size={13} /> FREE
                    </span>
                  ) : (
                    <span className="font-medium">
                      {formatBDT(totalShipping)}
                    </span>
                  )}
                </div>
                {checkout.notes && (
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">📝 {checkout.notes}</p>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-4 mt-4">
                  <div>
                    <span className="text-base font-bold text-gray-900">
                      Total Amount
                    </span>
                    <p className="text-xs text-gray-400">
                      Inclusive of all taxes
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {formatBDT(total)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Trust badges ── */}
          <div className="flex items-center justify-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-green-600" />
              <span className="text-xs text-gray-600">Secure</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <span className="text-xs text-gray-600">
                Instant Confirmation
              </span>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/checkout")}
              className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white
                         px-6 py-3.5 text-sm font-medium text-gray-600 hover:border-gray-300 transition-all"
            >
              <ChevronLeft size={16} />
              Back
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
                    className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white mr-2"
                  />
                  Creating Order...
                </>
              ) : (
                <>
                  <span>Create Order & Continue</span>
                  <ArrowRight
                    size={16}
                    className="ml-2 transition-transform group-hover:translate-x-0.5"
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
