/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Package,
  MapPin,
  CreditCard,
  User,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import {
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "@/services/order.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Image from "next/image";

const STATUS_STEPS = [
  { status: "PENDING", label: "Pending", icon: Clock },
  { status: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
  { status: "PROCESSING", label: "Processing", icon: RefreshCw },
  { status: "SHIPPED", label: "Shipped", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: CheckCircle },
  { status: "CANCELLED", label: "Cancelled", icon: XCircle },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  SUCCESS: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-700",
  REFUNDED: "bg-gray-50 text-gray-700",
};

// Allowed status transitions for vendor (based on current status)
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default function VendorOrderDetailsPage() {
  const { slug: orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusNote, setStatusNote] = useState("");

  const loadOrder = async () => {
    setLoading(true);
    setError(null);
    const res = await getOrderById(Number(orderId));
    if (res?.success && res.data) {
      setOrder(res.data);
      setSelectedStatus("");
      setStatusNote("");
    } else {
      setError(res?.message || "Failed to load order details");
      toast.error(res?.message || "Failed to load order details");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (orderId && !isNaN(Number(orderId))) {
      loadOrder();
    } else {
      setError("Invalid order ID");
      setLoading(false);
    }
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }
    if (!confirm(`Change order status to ${selectedStatus}?`)) return;
    setUpdating(true);
    try {
      const payload = { status: selectedStatus, note: statusNote || undefined };
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      const res = await updateOrderStatus(Number(orderId), formData);
      if (res?.success) {
        toast.success(`Order status updated to ${selectedStatus}`);
        loadOrder(); // refresh
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setUpdating(false);
      setSelectedStatus("");
      setStatusNote("");
    }
  };

  const handleCancelOrder = async () => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setUpdating(true);
    try {
      const payload = { cancelReason: reason };
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      const res = await cancelOrder(Number(orderId), formData);
      if (res?.success) {
        toast.success("Order cancelled successfully");
        loadOrder();
      } else {
        toast.error(res?.message || "Failed to cancel order");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          Error loading order
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {error || "Order not found"}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm"
        >
          <ChevronLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const currentStatus = order.status;
  const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
  const isCancellable =
    currentStatus !== "CANCELLED" && currentStatus !== "DELIVERED";

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Order Details
        </h2>
        <span
          className={cn(
            "ml-auto px-3 py-1 rounded-full text-xs font-medium border",
            STATUS_COLORS[currentStatus] || "bg-gray-50 text-gray-600",
          )}
        >
          {currentStatus}
        </span>
      </div>

      {/* Order summary card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Order Number</p>
            <p className="text-sm font-mono font-medium text-gray-900">
              #{order.orderNumber}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Order Date</p>
            <p className="text-sm text-gray-900">
              {formatDate(order.createdAt)}
            </p>
          </div>
          {order.deliveredAt && (
            <div>
              <p className="text-xs text-gray-500">Delivered At</p>
              <p className="text-sm text-gray-900">
                {formatDate(order.deliveredAt)}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-lg font-bold text-primary">
              {formatBDT(Number(order.total))}
            </p>
          </div>
        </div>

        {/* Order timeline (optional) */}
        <div className="pt-2">
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted =
                STATUS_STEPS.findIndex((s) => s.status === currentStatus) >=
                idx;
              const Icon = step.icon;
              return (
                <div key={step.status} className="flex items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isCompleted
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-400",
                    )}
                  >
                    <Icon size={14} />
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-8 h-0.5",
                        isCompleted ? "bg-primary" : "bg-gray-200",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            {STATUS_STEPS.map((step) => (
              <span key={step.status} className="w-16 text-center">
                {step.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Items & Customer details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <ShoppingBag size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Order Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 text-xs text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Product</th>
                    <th className="px-5 py-3 text-left">SKU</th>
                    <th className="px-5 py-3 text-center">Quantity</th>
                    <th className="px-5 py-3 text-right">Unit Price</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {item.product?.images?.[0]?.url ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                              height={30}
                              width={30}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package size={18} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.product?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Variant: {item.variant?.name || "Default"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs font-mono text-gray-500">
                        {item.variant?.sku || "—"}
                      </td>
                      <td className="px-5 py-3 text-center text-sm">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-3 text-right text-sm">
                        {formatBDT(Number(item.unitPrice))}
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-medium">
                        {formatBDT(Number(item.totalPrice))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50/50 border-t border-gray-100">
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-3 text-right text-sm font-medium"
                    >
                      Subtotal
                    </td>
                    <td className="px-5 py-3 text-right text-sm">
                      {formatBDT(Number(order.subtotal))}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-5 py-3 text-right text-sm">
                      Shipping Fee
                    </td>
                    <td className="px-5 py-3 text-right text-sm">
                      {formatBDT(Number(order.shippingFee))}
                    </td>
                  </tr>
                  {order.discount > 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-3 text-right text-sm text-green-600"
                      >
                        Discount
                      </td>
                      <td className="px-5 py-3 text-right text-sm text-green-600">
                        -{formatBDT(Number(order.discount))}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-3 text-right font-bold text-gray-900"
                    >
                      Total
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-primary">
                      {formatBDT(Number(order.total))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <User size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">
                Customer Information
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Name:</span>{" "}
                {order.user?.accountInfo?.firstName}{" "}
                {order.user?.accountInfo?.lastName}
              </p>
              <p>
                <span className="text-gray-500">Email:</span>{" "}
                {order.user?.email}
              </p>
              {order.user?.accountInfo?.phone && (
                <p>
                  <span className="text-gray-500">Phone:</span>{" "}
                  {order.user.accountInfo.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Shipping, Payment, Actions */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Shipping Address</h3>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress?.city_district},{" "}
                {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
              <p className="text-gray-500">
                Phone: {order.shippingAddress?.phone}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">
                Payment Information
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Method:</span>{" "}
                {order.payment?.method?.replace(/_/g, " ")}
              </p>
              <p>
                <span className="text-gray-500">Status:</span>{" "}
                <span
                  className={cn(
                    "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                    PAYMENT_STATUS_COLORS[order.payment?.status] ||
                      "bg-gray-100 text-gray-600",
                  )}
                >
                  {order.payment?.status || "N/A"}
                </span>
              </p>
              {order.payment?.transactionId && (
                <p>
                  <span className="text-gray-500">Transaction ID:</span>{" "}
                  <span className="font-mono text-xs">
                    {order.payment.transactionId}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Order Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Order Actions</h3>
            <div className="space-y-3">
              {allowedNextStatuses.length > 0 && (
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Change Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Select status</option>
                    {allowedNextStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Optional note..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="mt-2 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    rows={2}
                  />
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating || !selectedStatus}
                    className="mt-2 w-full py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
                  >
                    Update Status
                  </button>
                </div>
              )}
              {isCancellable && (
                <button
                  onClick={handleCancelOrder}
                  disabled={updating}
                  className="w-full py-2 rounded-xl border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
