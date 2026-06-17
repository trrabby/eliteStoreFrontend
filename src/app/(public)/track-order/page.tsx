/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { trackOrder } from "@/services/order.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import Link from "next/link";

const STATUS_META: Record<string, { icon: any; color: string; label: string }> =
  {
    PENDING: {
      icon: Clock,
      color: "text-yellow-500 bg-yellow-50",
      label: "Order Pending",
    },
    CONFIRMED: {
      icon: CheckCircle,
      color: "text-blue-500 bg-blue-50",
      label: "Order Confirmed",
    },
    PROCESSING: {
      icon: Package,
      color: "text-purple-500 bg-purple-50",
      label: "Processing",
    },
    SHIPPED: {
      icon: Truck,
      color: "text-indigo-500 bg-indigo-50",
      label: "Shipped",
    },
    OUT_FOR_DELIVERY: {
      icon: Truck,
      color: "text-orange-500 bg-orange-50",
      label: "Out for Delivery",
    },
    DELIVERED: {
      icon: CheckCircle,
      color: "text-green-500 bg-green-50",
      label: "Delivered",
    },
    CANCELLED: {
      icon: XCircle,
      color: "text-red-500 bg-red-50",
      label: "Cancelled",
    },
    RETURNED: {
      icon: Package,
      color: "text-gray-500 bg-gray-50",
      label: "Returned",
    },
  };

const TIMELINE_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function TrackOrderPage() {
  const user = useAppSelector(selectCurrentUser);
  const [input, setInput] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim().toUpperCase();
    if (!trimmed) return;

    if (!user) {
      setError("Please login to track your order.");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await trackOrder(trimmed);
      if (res?.success && res.data) {
        setOrder(res.data);
      } else {
        setError(
          "Order not found. Please check the order number and try again.",
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? TIMELINE_STEPS.indexOf(order.status) : -1;

  const meta = order ? STATUS_META[order.status] ?? STATUS_META.PENDING : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-linear-to-br from-primary/10 to-white py-14 px-4 text-center">
        <div className="container-elite max-w-xl mx-auto">
          <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            অর্ডার ট্র্যাক করুন • Track Order
          </span>
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">
            Track Your Order
          </h1>
          <p className="text-gray-500 text-sm font-hind">
            আপনার অর্ডারের বর্তমান অবস্থা জানুন।
          </p>
        </div>
      </section>

      <div className="container-elite py-10 px-4 max-w-2xl mx-auto space-y-6">
        {/* Search form */}
        <div className="card p-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Order Number
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. ORD-12345678-1234"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none
                               focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-6 py-3 text-sm disabled:opacity-60"
                >
                  {loading ? "Tracking..." : "Track"}
                </button>
              </div>
            </div>

            {!user && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                <Link
                  href="/login?redirect=/track-order"
                  className="font-semibold hover:underline"
                >
                  Login
                </Link>{" "}
                to track your orders. Orders are linked to your account.
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1.5">
                <XCircle size={14} /> {error}
              </p>
            )}
          </form>
        </div>

        {/* Result */}
        {order && meta && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Status banner */}
            <div
              className={cn(
                "card p-5 flex items-center gap-4",
                meta.color.split(" ")[1],
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  meta.color,
                )}
              >
                <meta.icon size={22} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{meta.label}</p>
                <p className="text-xs text-gray-500">
                  Order #{order.orderNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  {formatBDT(order.total ?? 0)}
                </p>
                <p className="text-xs text-gray-400">
                  {order.items?.length ?? 0} item(s)
                </p>
              </div>
            </div>

            {/* Timeline */}
            {!["CANCELLED", "RETURNED", "REFUNDED"].includes(order.status) && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                  Order Progress
                </h3>
                <div className="space-y-3">
                  {TIMELINE_STEPS.map((step, i) => {
                    const done = i <= currentStepIndex;
                    const current = i === currentStepIndex;
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all",
                            done
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-400",
                          )}
                        >
                          {done ? "✓" : i + 1}
                        </div>
                        <div className="flex-1">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              current
                                ? "text-primary"
                                : done
                                ? "text-gray-900"
                                : "text-gray-400",
                            )}
                          >
                            {STATUS_META[step]?.label ?? step}
                          </p>
                        </div>
                        {current && (
                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipment */}
            {order.shipment?.trackingNumber && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                  <Truck size={15} className="text-primary" /> Shipment Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Carrier</span>
                    <span className="font-medium">
                      {order.shipment.carrier ?? "Steadfast"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tracking No.</span>
                    <span className="font-mono font-medium text-primary">
                      {order.shipment.trackingNumber}
                    </span>
                  </div>
                  {order.shipment.estimatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Est. Delivery</span>
                      <span className="font-medium">
                        {formatDate(order.shipment.estimatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <Package size={15} className="text-primary" />
                <h3 className="font-semibold text-gray-900 text-sm">
                  Order Items
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {(order.items ?? []).slice(0, 5).map((item: any) => (
                  <div
                    key={item.id}
                    className="px-5 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {(item.snapshot as any)?.productName ??
                          item.product?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-primary">
                      {formatBDT(item.totalPrice ?? 0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/account/orders"
                className="text-sm text-primary hover:underline"
              >
                View all orders in My Account →
              </Link>
            </div>
          </motion.div>
        )}

        {/* Login prompt */}
        {!user && (
          <div className="card p-8 text-center">
            <Package size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="font-semibold text-gray-900 mb-1">
              Login to Track Orders
            </p>
            <p className="text-sm text-gray-500 mb-5 font-hind">
              আপনার অর্ডার ট্র্যাক করতে লগইন করুন।
            </p>
            <Link
              href="/login?redirect=/track-order"
              className="btn-primary px-8 py-3 text-sm"
            >
              Login Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
