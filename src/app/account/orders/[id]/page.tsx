/* eslint-disable react/no-unescaped-entities */
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
  X,
  Calendar,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle,
  ShoppingBag,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getMyOrderById, cancelOrder } from "@/services/order.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { ReturnModal } from "@/components/modals/ReturnRequesModal";
import { WriteReviewModal } from "@/components/modals/WriteReviewModal";

// ─── Status config ──────────────────────────────────────────────
const STATUS_META: Record<
  string,
  { color: string; bg: string; icon: any; label: string }
> = {
  PENDING: {
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    icon: Clock,
    label: "Pending",
  },
  CONFIRMED: {
    color: "text-blue-700",
    bg: "bg-blue-50",
    icon: CheckCircle,
    label: "Confirmed",
  },
  PROCESSING: {
    color: "text-purple-700",
    bg: "bg-purple-50",
    icon: Clock,
    label: "Processing",
  },
  SHIPPED: {
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    icon: Truck,
    label: "Shipped",
  },
  DELIVERED: {
    color: "text-green-700",
    bg: "bg-green-50",
    icon: CheckCircle,
    label: "Delivered",
  },
  CANCELLED: {
    color: "text-red-700",
    bg: "bg-red-50",
    icon: AlertCircle,
    label: "Cancelled",
  },
  RETURNED: {
    color: "text-gray-700",
    bg: "bg-gray-50",
    icon: RotateCcw,
    label: "Returned",
  },
};

const TIMELINE = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

// ─── Cancel Modal ──────────────────────────────────────────────
function CancelModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <AnimatePresence>
      {open && (
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
            className="fixed inset-4 z-50 mx-auto max-w-md bg-white rounded-3xl shadow-2xl p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-gray-900">
                  Cancel Order
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Please tell us why you're cancelling
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reason for cancellation
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="e.g., Changed my mind, Found cheaper elsewhere, etc."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none resize-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <p className="mt-1 text-xs text-gray-400">
                This helps us improve your shopping experience
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Yes, Cancel"
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await getMyOrderById(Number(id));
      if (res?.success) setOrder(res.data);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleCancel = async (reason: string) => {
    setCancelling(true);
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify({ cancelReason: reason }));
      const res = await cancelOrder(Number(id), fd);
      if (res?.success) {
        toast.success("Order cancelled successfully");
        setOrder((prev: any) => ({ ...prev, status: "CANCELLED" }));
        setShowCancelModal(false);
      } else {
        toast.error(res?.message ?? "Failed to cancel order");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setCancelling(false);
    }
  };

  const handlePayNow = () => {
    // Save order items to checkout store and redirect
    // For simplicity, we'll redirect to checkout with orderId param
    router.push(`/checkout?orderId=${order.id}`);
  };

  const handleReturnSuccess = () => {
    // Refresh order data
    getMyOrderById(Number(id)).then((res) => {
      if (res?.success) setOrder(res.data);
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!order) {
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
  }

  const statusMeta = STATUS_META[order.status] || STATUS_META.PENDING;
  const canCancel =
    ["PENDING", "CONFIRMED"].includes(order.status) &&
    order.status !== "CANCELLED";
  const canReturn = order.status === "DELIVERED";
  const canPay =
    order.status !== "CANCELLED" &&
    (!order.payment || order.payment.status !== "SUCCESS") &&
    order.status !== "DELIVERED" &&
    order.status !== "RETURNED";

  const currentStep = TIMELINE.indexOf(order.status);
  const isDelivered = order.status === "DELIVERED";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Order #{order.orderNumber}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(order.createdAt)}
            </span>
            <span
              className={cn(
                "text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5",
                statusMeta.bg,
                statusMeta.color,
              )}
            >
              <statusMeta.icon size={12} />
              {statusMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Timeline ─── */}
      {!["CANCELLED", "RETURNED"].includes(order.status) && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            {TIMELINE.map((step, i) => {
              const isActive = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                        isActive
                          ? "bg-gradient-to-br from-primary to-primary/80 border-primary text-white shadow-md shadow-primary/20"
                          : "bg-white border-gray-200 text-gray-400",
                      )}
                    >
                      {isActive && i < currentStep ? (
                        <CheckCircle size={16} />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs mt-1.5 whitespace-nowrap font-medium",
                        isActive ? "text-gray-700" : "text-gray-400",
                      )}
                    >
                      {step.charAt(0) + step.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-1 rounded-full transition-all duration-500",
                        i < currentStep ? "bg-primary" : "bg-gray-200",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Items ─── */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={18} className="text-primary" />
          Items ({order.items?.length ?? 0})
        </h3>
        <div className="divide-y divide-gray-100">
          {order.items?.map((item: any) => {
            const imageUrl = item.product?.images?.[0]?.url;
            const hasReview = item.review !== null;
            return (
              <div
                key={item.id}
                className="flex gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-primary-pale shrink-0 shadow-sm">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.product?.name || "Product"}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {item.product?.name || "Product"}
                      </p>
                      {item.variant?.name && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.variant.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary shrink-0 ml-4">
                      {formatBDT(Number(item.unitPrice) * item.quantity)}
                    </span>
                  </div>
                  {/* Review button for delivered orders */}
                  {isDelivered && (
                    <div className="mt-2">
                      <button
                        onClick={() => setReviewingItem(item)}
                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <Star size={12} />
                        {hasReview ? "Edit Review" : "Write Review"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Grid: Address / Payment ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Delivery Address */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            Delivery Address
          </h3>
          {order.shippingAddress ? (
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.fullName}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 &&
                  `, ${order.shippingAddress.addressLine2}`}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress.city_district},{" "}
                {order.shippingAddress.country}
                {order.shippingAddress.postalCode &&
                  ` - ${order.shippingAddress.postalCode}`}
              </p>
              <div className="flex items-center gap-4 text-gray-500 text-xs pt-1">
                <span className="flex items-center gap-1">
                  <Phone size={12} /> {order.shippingAddress.phone}
                </span>
                {order.shippingAddress.landmark && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {order.shippingAddress.landmark}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No address available</p>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-primary" />
            Payment Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatBDT(Number(order.subtotal) ?? 0)}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatBDT(Number(order.discount))}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>
                {Number(order.shippingFee) === 0
                  ? "FREE"
                  : formatBDT(Number(order.shippingFee) ?? 60)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-3 border-t border-gray-100">
              <span>Total</span>
              <span className="text-primary text-lg">
                {formatBDT(Number(order.total) ?? 0)}
              </span>
            </div>
          </div>

          {/* Payment status */}
          {order.payment && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <CreditCard size={12} />
                {order.payment.method?.replace(/_/g, " ")}
              </span>
              <span
                className={cn(
                  "font-medium px-2 py-0.5 rounded-full",
                  order.payment.status === "SUCCESS"
                    ? "bg-green-50 text-green-700"
                    : order.payment.status === "PENDING"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-gray-50 text-gray-700",
                )}
              >
                {order.payment.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Shipment (if exists) ─── */}
      {order.shipment && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Truck size={16} className="text-primary" />
            Shipment Tracking
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Tracking Number</span>
              <p className="font-mono font-semibold text-gray-900">
                {order.shipment.trackingNumber}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Carrier</span>
              <p className="font-medium text-gray-900">
                {order.shipment.carrier}
              </p>
            </div>
            {order.shipment.estimatedAt && (
              <div className="col-span-full">
                <span className="text-gray-500">Estimated Delivery</span>
                <p className="font-medium text-gray-900">
                  {formatDate(order.shipment.estimatedAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Actions ─── */}
      <div className="flex flex-wrap gap-3 pt-2">
        {canPay && (
          <button
            onClick={handlePayNow}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <ShoppingBag size={16} />
            Pay Now
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={cancelling}
            className="px-6 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-60 flex items-center gap-2"
          >
            <X size={16} />
            Cancel Order
          </button>
        )}
        {canReturn && (
          <button
            onClick={() => setShowReturnModal(true)}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Return Items
          </button>
        )}
      </div>

      {/* ─── Cancel Modal ─── */}
      <CancelModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        loading={cancelling}
      />

      {/* ─── Return Modal ─── */}
      <AnimatePresence>
        {showReturnModal && (
          <ReturnModal
            orderId={Number(id)}
            items={order.items.map((item: any) => ({
              id: item.id,
              productName: item.product?.name || "Product",
              variantName: item.variant?.name,
              maxQuantity: item.quantity,
            }))}
            onClose={() => setShowReturnModal(false)}
            onSuccess={handleReturnSuccess}
          />
        )}
      </AnimatePresence>

      {/* ─── Review Modal ─── */}
      <AnimatePresence>
        {reviewingItem && (
          <WriteReviewModal
            productId={reviewingItem.productId}
            orderItemId={reviewingItem.id}
            initialData={reviewingItem.review || undefined}
            onClose={() => setReviewingItem(null)}
            onSuccess={() => {
              setReviewingItem(null);
              // Refresh order to update review status
              getMyOrderById(Number(id)).then((res) => {
                if (res?.success) setOrder(res.data);
              });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
