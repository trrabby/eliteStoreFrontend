"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck, MapPin, Package } from "lucide-react";
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
import { initiatePayment } from "@/services/payment.service";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { formatBDT } from "@/lib/utils/currency";
import type { IAddress } from "@/types/user.types";
import Image from "next/image";

export default function CheckoutReviewPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const checkout = useAppSelector(selectCheckout);
  const { items, subtotal } = useCart();

  const [address, setAddress] = useState<IAddress | null>(null);
  const [placing, setPlacing] = useState(false);

  const loadAddress = useCallback(async () => {
    if (!checkout.selectedAddressId) return;

    try {
      const res = await getMyAddresses();

      if (res?.success) {
        const addr =
          res.data?.find(
            (a: IAddress) => a.id === checkout.selectedAddressId,
          ) ?? null;

        setAddress((prev) => {
          if (prev?.id === addr?.id) {
            return prev;
          }

          return addr;
        });
      }
    } catch {
      toast.error("Failed to load address.");
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

    if (!checkout.paymentMethod) {
      router.push("/checkout/payment");
      return;
    }

    const fetchAddress = async () => {
      await loadAddress();
    };

    fetchAddress();
  }, [
    user,
    checkout.selectedAddressId,
    checkout.paymentMethod,
    router,
    loadAddress,
  ]);

  const shippingFee = subtotal >= 1000 ? 0 : 60;
  const discount = checkout.couponDiscount ?? 0;
  const total = Math.max(0, subtotal + shippingFee - discount);

  const handlePlaceOrder = async () => {
    if (!address || !checkout.paymentMethod) return;
    setPlacing(true);

    try {
      // 1 — create order
      const orderFd = new FormData();
      orderFd.append(
        "data",
        JSON.stringify({
          shippingAddressId: checkout.selectedAddressId,
          paymentMethod: checkout.paymentMethod,
          couponId: checkout.couponId ?? undefined,
          notes: checkout.notes || undefined,
        }),
      );

      const orderRes = await createOrder(orderFd);

      if (!orderRes?.success) {
        toast.error(orderRes?.message ?? "Failed to place order.");
        return;
      }

      const { id: orderId, publicId, orderNumber } = orderRes.data;

      dispatch(
        setPlacedOrder({ orderId, orderPublicId: publicId, orderNumber }),
      );

      // 2 — initiate payment
      const payFd = new FormData();
      payFd.append(
        "data",
        JSON.stringify({
          orderId,
          method: checkout.paymentMethod,
        }),
      );

      const payRes = await initiatePayment(payFd);

      if (!payRes?.success) {
        toast.error(payRes?.message ?? "Payment initiation failed.");
        return;
      }

      // clear cart + checkout
      dispatch(clearCart());
      dispatch(resetCheckout());

      // COD → direct success
      if (checkout.paymentMethod === "CASH_ON_DELIVERY") {
        router.push(`/payment/success?order=${orderNumber}`);
        return;
      }

      // Online payment → redirect to gateway
      if (payRes.data?.redirectUrl) {
        window.location.href = payRes.data.redirectUrl;
        return;
      }

      router.push(`/payment/success?order=${orderNumber}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container-elite py-6 max-w-2xl">
      <CheckoutProgress />

      <div className="space-y-4">
        {/* Order items */}
        <div className="card p-6">
          <h2
            className="font-display text-xl font-bold text-gray-900 mb-4
                         flex items-center gap-2"
          >
            <Package size={20} className="text-primary" />
            Order Items ({items.length})
          </h2>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-3 items-center">
                <div
                  className="relative w-14 h-14 rounded-xl overflow-hidden
                                bg-primary-pale shrink-0"
                >
                  <Image
                    src={item.product.images?.[0]?.url ?? "/placeholder.png"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.product.name}
                  </p>
                  {item.variant.name && (
                    <p className="text-xs text-gray-500">{item.variant.name}</p>
                  )}
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-bold text-primary shrink-0">
                  {formatBDT(Number(item.variant.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery address */}
        {address && (
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              Delivering to
            </h3>
            <p className="font-medium text-gray-900">{address.fullName}</p>
            <p className="text-sm text-gray-600 mt-0.5">
              {address.addressLine1}
              {address.addressLine2 && `, ${address.addressLine2}`}
            </p>
            <p className="text-sm text-gray-600">
              {address.city_district}, {address.country}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">📞 {address.phone}</p>
          </div>
        )}

        {/* Payment summary */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>

          <div
            className="flex items-center gap-2 mb-4 bg-primary-pale
                          rounded-xl p-3"
          >
            <span className="text-lg">
              {checkout.paymentMethod === "CASH_ON_DELIVERY"
                ? "💵"
                : checkout.paymentMethod === "BKASH"
                  ? "📱"
                  : checkout.paymentMethod === "NAGAD"
                    ? "📱"
                    : "💳"}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {checkout.paymentMethod === "CASH_ON_DELIVERY"
                ? "Cash on Delivery"
                : checkout.paymentMethod === "BKASH"
                  ? "bKash"
                  : checkout.paymentMethod === "NAGAD"
                    ? "Nagad"
                    : "Card / Net Banking"}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatBDT(subtotal)}</span>
            </div>
            {checkout.couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon ({checkout.couponCode})</span>
                <span>-{formatBDT(checkout.couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              {subtotal >= 1000 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                <span>{formatBDT(shippingFee)}</span>
              )}
            </div>
            <div
              className="flex justify-between font-bold text-gray-900
                            text-base pt-2 border-t border-gray-100"
            >
              <span>Total Payable</span>
              <span className="text-primary">{formatBDT(total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/checkout/payment")}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl
                       border-2 border-gray-200 text-sm font-medium
                       text-gray-600 hover:border-gray-300 transition-all"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <MagneticButton
            onClick={handlePlaceOrder}
            disabled={placing}
            strength={0.25}
            className="flex-1 btn-primary py-3.5 flex items-center
                       justify-center gap-2 disabled:opacity-70"
          >
            {placing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-5 h-5 border-2 border-white/30
                             border-t-white rounded-full"
                />
                Placing Order...
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                Place Order — {formatBDT(total)}
              </>
            )}
          </MagneticButton>
        </div>

        <p className="text-xs text-center text-gray-400">
          🔒 Your payment is secured by SSL encryption
        </p>
      </div>
    </div>
  );
}
