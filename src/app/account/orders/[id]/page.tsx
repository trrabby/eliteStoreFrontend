/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getMyOrderById, cancelOrder } from "@/services/order.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-blue-50   text-blue-700",
  PROCESSING: "bg-purple-50 text-purple-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-green-50  text-green-700",
  CANCELLED: "bg-red-50    text-red-700",
};

const TIMELINE = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await getMyOrderById(Number(id));
      if (res?.success) setOrder(res.data);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleCancel = async () => {
    if (!confirm("Cancel this order?")) return;
    setCancelling(true);
    const fd = new FormData();
    fd.append(
      "data",
      JSON.stringify({ reason: "Customer requested cancellation" }),
    );
    const res = await cancelOrder(Number(id), fd);
    if (res?.success) {
      toast.success("Order cancelled");
      setOrder((prev: any) => ({ ...prev, status: "CANCELLED" }));
    } else {
      toast.error(res?.message ?? "Failed to cancel");
    }
    setCancelling(false);
  };

  if (loading)
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
    );

  if (!order)
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500">Order not found.</p>
        <Link
          href="/account/orders"
          className="btn-primary px-6 py-2.5 text-sm mt-4 inline-block"
        >
          Back to Orders
        </Link>
      </div>
    );

  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);
  const canReturn = order.status === "DELIVERED";
  const currentStep = TIMELINE.indexOf(order.status);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">
            Order #{order.orderNumber}
          </h2>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <span
          className={cn(
            "ml-auto text-xs px-3 py-1 rounded-full font-medium",
            STATUS_COLORS[order.status] ?? "bg-gray-50 text-gray-600",
          )}
        >
          {order.status}
        </span>
      </div>

      {/* Timeline */}
      {!["CANCELLED", "RETURNED"].includes(order.status) && (
        <div className="card p-5">
          <div className="flex items-center justify-between">
            {TIMELINE.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                      i <= currentStep
                        ? "bg-primary border-primary text-white"
                        : "bg-white border-gray-200 text-gray-400",
                    )}
                  >
                    {i < currentStep ? "✓" : i + 1}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 hidden sm:block whitespace-nowrap">
                    {step.charAt(0) + step.slice(1).toLowerCase()}
                  </span>
                </div>
                {i < TIMELINE.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-1",
                      i < currentStep ? "bg-primary" : "bg-gray-200",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={16} className="text-primary" />
          Items ({order.items?.length ?? 0})
        </h3>
        <div className="space-y-3">
          {order.items?.map((item: any) => (
            <div
              key={item.id}
              className="flex gap-3 items-center py-2 border-b border-gray-50 last:border-0"
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-primary-pale shrink-0">
                {item.product?.images?.[0]?.url && (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {item.product?.name}
                </p>
                {item.variant?.name && (
                  <p className="text-xs text-gray-500">{item.variant.name}</p>
                )}
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-bold text-primary shrink-0">
                {formatBDT(Number(item.unitPrice) * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Delivery address */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin size={15} className="text-primary" />
            Delivery Address
          </h3>
          {order.shippingAddress ? (
            <>
              <p className="font-medium text-gray-900 text-sm">
                {order.shippingAddress.fullName}
              </p>
              <p className="text-sm text-gray-600">
                {order.shippingAddress.addressLine1}
              </p>
              <p className="text-sm text-gray-600">
                {order.shippingAddress.city_district}
              </p>
              <p className="text-sm text-gray-500">
                📞 {order.shippingAddress.phone}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">No address</p>
          )}
        </div>

        {/* Payment */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CreditCard size={15} className="text-primary" />
            Payment Summary
          </h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatBDT(order.subtotal ?? 0)}</span>
            </div>
            {(order.discountAmount ?? 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatBDT(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>
                {order.shippingFee === 0
                  ? "FREE"
                  : formatBDT(order.shippingFee ?? 60)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-100">
              <span>Total</span>
              <span className="text-primary">
                {formatBDT(order.totalAmount ?? 0)}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {order.paymentMethod?.replace("_", " ")} —{" "}
            <span
              className={
                order.paymentStatus === "PAID"
                  ? "text-green-600"
                  : "text-amber-600"
              }
            >
              {order.paymentStatus ?? "Pending"}
            </span>
          </p>
        </div>
      </div>

      {/* Shipment */}
      {order.shipment && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Truck size={15} className="text-primary" />
            Shipment
          </h3>
          <p className="text-sm text-gray-700">
            Tracking:{" "}
            <span className="font-mono font-semibold">
              {order.shipment.trackingNumber}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            Carrier: {order.shipment.carrier}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="btn-secondary px-5 py-2.5 text-sm border-red-200 text-red-500 hover:bg-red-500 disabled:opacity-60"
          >
            Cancel Order
          </button>
        )}
        {canReturn && (
          <Link
            href={`/account/returns?orderId=${order.id}`}
            className="btn-secondary px-5 py-2.5 text-sm flex items-center gap-2"
          >
            <RotateCcw size={14} />
            Return Items
          </Link>
        )}
      </div>
    </div>
  );
}
