/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Package,
  MapPin,
  CreditCard,
  User,
  Truck,
  XCircle,
  AlertCircle,
  ShoppingBag,
  Link as LinkIcon,
  History,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "@/services/order.service";
import { createShipment } from "@/services/shipment.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Image from "next/image";

// Full status transition map (consistent with orders list)
const isValidStatusTransition = (current: string, next: string): boolean => {
  const transitions: Record<string, string[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PROCESSING", "SHIPPED", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"],
    OUT_FOR_DELIVERY: ["DELIVERED"],
    DELIVERED: [],
    RETURN_REQUESTED: ["RETURNED", "DELIVERED"],
    RETURNED: ["REFUNDED"],
    CANCELLED: [],
    REFUNDED: [],
  };
  return transitions[current]?.includes(next) ?? false;
};

const getAllowedNextStatuses = (currentStatus: string): string[] => {
  const transitions: Record<string, string[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PROCESSING", "SHIPPED", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"],
    OUT_FOR_DELIVERY: ["DELIVERED"],
    DELIVERED: [],
    RETURN_REQUESTED: ["RETURNED", "DELIVERED"],
    RETURNED: ["REFUNDED"],
    CANCELLED: [],
    REFUNDED: [],
  };
  return transitions[currentStatus] || [];
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700 border-orange-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  RETURN_REQUESTED: "bg-pink-50 text-pink-700 border-pink-200",
  RETURNED: "bg-gray-50 text-gray-700 border-gray-200",
  REFUNDED: "bg-gray-50 text-gray-700 border-gray-200",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  INITIATED: "bg-blue-50 text-blue-700",
  SUCCESS: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-50 text-gray-700",
  REFUNDED: "bg-purple-50 text-purple-700",
  PARTIALLY_REFUNDED: "bg-orange-50 text-orange-700",
};

// Generate random tracking number
const generateTrackingNumber = (carrier: string): string => {
  const prefix = carrier.slice(0, 2).toUpperCase();
  const randomNum = Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, "0");
  return `${prefix}-${randomNum}`;
};

export default function VendorOrderDetailsPage() {
  const { slug: orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
  const [shipmentForm, setShipmentForm] = useState({
    carrier: "",
    trackingNumber: "",
    trackingUrl: "",
    estimatedAt: "",
  });

  const loadOrder = async () => {
    setLoading(true);
    setError(null);
    const res = await getOrderById(Number(orderId));
    if (res?.success && res.data) {
      setOrder(res.data);
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

  const handleStatusUpdate = async (newStatus: string) => {
    if (!isValidStatusTransition(order.status, newStatus)) {
      toast.error(`Cannot move from ${order.status} to ${newStatus}`);
      return;
    }

    let modalHtml = `<div class="text-left"><p class="text-sm text-gray-600 mb-2">Move order to ${newStatus}?</p>`;
    if (newStatus === "DELIVERED") {
      modalHtml += `
        <div class="mt-3 pt-2 border-t border-gray-100">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="paymentReceivedCheckbox" class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary">
            <span class="text-sm text-gray-700">Payment received from customer</span>
          </label>
        </div>
      `;
    }
    modalHtml += `<div class="mt-3"><textarea id="statusNote" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" rows="2" placeholder="Optional note..."></textarea></div>`;
    modalHtml += `</div>`;

    const result = await Swal.fire({
      title: "Change Order Status?",
      html: modalHtml,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "bg-primary text-white px-5 py-2.5 rounded-xl",
        cancelButton: "bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl",
      },
      buttonsStyling: false,
      preConfirm: () => {
        const noteTextarea = document.getElementById(
          "statusNote",
        ) as HTMLTextAreaElement;
        const note = noteTextarea?.value || "";
        let isPaymentReceived = false;
        if (newStatus === "DELIVERED") {
          const checkbox = document.getElementById(
            "paymentReceivedCheckbox",
          ) as HTMLInputElement;
          isPaymentReceived = checkbox?.checked || false;
        }
        return { note, isPaymentReceived };
      },
    });

    if (!result.isConfirmed) return;

    setUpdating(true);
    try {
      const payload: any = {
        status: newStatus,
        note: result.value?.note || `Order status changed to ${newStatus}`,
      };
      if (
        newStatus === "DELIVERED" &&
        result.value?.isPaymentReceived === true
      ) {
        payload.isPaymentReceived = true;
      }
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      const res = await updateOrderStatus(Number(orderId), formData);
      if (res?.success) {
        toast.success(`Order moved to ${newStatus}`);
        loadOrder();
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    const { value: reason } = await Swal.fire({
      title: "Cancel Order",
      input: "textarea",
      inputLabel: "Cancellation reason",
      inputPlaceholder: "Enter the reason for cancellation...",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel",
      cancelButtonText: "Back",
      inputValidator: (value) => (value ? null : "Reason is required!"),
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "bg-red-600 text-white px-5 py-2.5 rounded-xl",
        cancelButton: "bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl",
      },
      buttonsStyling: false,
    });
    if (!reason) return;

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

  const openShipmentModal = () => {
    setShipmentForm({
      carrier: "",
      trackingNumber: "",
      trackingUrl: "",
      estimatedAt: "",
    });
    setShipmentModalOpen(true);
  };

  const handleShipmentFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setShipmentForm((prev) => ({ ...prev, [name]: value }));
    if (name === "carrier" && value) {
      setShipmentForm((prev) => ({
        ...prev,
        trackingNumber: generateTrackingNumber(value),
      }));
    }
  };

  const handleCreateShipment = async () => {
    if (!order) return;
    if (!shipmentForm.carrier || !shipmentForm.trackingNumber) {
      toast.error("Carrier and tracking number are required");
      return;
    }
    setUpdating(true);
    try {
      const payload = {
        orderId: order.id,
        carrier: shipmentForm.carrier,
        trackingNumber: shipmentForm.trackingNumber,
        trackingUrl: shipmentForm.trackingUrl || undefined,
        estimatedAt: shipmentForm.estimatedAt || undefined,
      };
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      const res = await createShipment(formData);
      if (res?.success) {
        toast.success(`Shipment created for order #${order.orderNumber}`);
        setShipmentModalOpen(false);
        loadOrder();
      } else {
        toast.error(res?.message || "Failed to create shipment");
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
  const allowedNextStatuses = getAllowedNextStatuses(currentStatus);
  const isCancellable =
    currentStatus !== "CANCELLED" && currentStatus !== "DELIVERED";
  const canCreateShipment =
    (currentStatus === "CONFIRMED" || currentStatus === "PROCESSING") &&
    !order.shipment;
  const timeline = order.statusHistory
    ? [...order.statusHistory].reverse()
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Order Details
        </h1>
      </div>

      {/* Main Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2/3 width) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingBag size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order Number</p>
                  <p className="text-base font-mono font-bold text-gray-900">
                    #{order.orderNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-xl font-bold text-primary">
                    {formatBDT(Number(order.total))}
                  </p>
                </div>
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    STATUS_COLORS[currentStatus],
                  )}
                >
                  {currentStatus.replace(/_/g, " ")}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Order Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Items</p>
                <p className="text-sm font-medium text-gray-900">
                  {order.items?.length || 0} products
                </p>
              </div>
              {order.deliveredAt && (
                <div>
                  <p className="text-xs text-gray-500">Delivered On</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(order.deliveredAt)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Payment</p>
                <p className="text-sm font-medium text-gray-900">
                  {order.payment?.method?.replace(/_/g, " ")} •{" "}
                  <span
                    className={cn(
                      "inline-block",
                      PAYMENT_STATUS_COLORS[order.payment?.status] ||
                        "text-gray-600",
                    )}
                  >
                    {order.payment?.status || "N/A"}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/30">
              <Package size={16} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900 text-sm">
                Order Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 text-xs text-gray-500">
                  <tr>
                    <th className="px-5 py-2 text-left">Product</th>
                    <th className="px-5 py-2 text-left">SKU</th>
                    <th className="px-5 py-2 text-center">Qty</th>
                    <th className="px-5 py-2 text-right">Unit Price</th>
                    <th className="px-5 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items?.map((item: any, idx: number) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-gray-50/50"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {item.product?.images?.[0]?.url ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              width={36}
                              height={36}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.product?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.variant?.name || "Default"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">
                        {item.variant?.sku || "—"}
                      </td>
                      <td className="px-5 py-3 text-center">{item.quantity}</td>
                      <td className="px-5 py-3 text-right">
                        {formatBDT(Number(item.unitPrice))}
                      </td>
                      <td className="px-5 py-3 text-right font-medium">
                        {formatBDT(Number(item.totalPrice))}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50/50 border-t border-gray-100 text-sm">
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-2 text-right font-medium"
                    >
                      Subtotal
                    </td>
                    <td className="px-5 py-2 text-right">
                      {formatBDT(Number(order.subtotal))}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-5 py-2 text-right">
                      Shipping Fee
                    </td>
                    <td className="px-5 py-2 text-right">
                      {formatBDT(Number(order.shippingFee))}
                    </td>
                  </tr>
                  {order.discount > 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-2 text-right text-green-600"
                      >
                        Discount
                      </td>
                      <td className="px-5 py-2 text-right text-green-600">
                        -{formatBDT(Number(order.discount))}
                      </td>
                    </tr>
                  )}
                  <tr className="font-bold">
                    <td colSpan={4} className="px-5 py-2 text-right">
                      Total
                    </td>
                    <td className="px-5 py-2 text-right text-primary">
                      {formatBDT(Number(order.total))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>

          {/* Customer, Shipping, Payment, Shipment in a 2-column subgrid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Customer Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <User size={16} className="text-gray-500" />
                <h3 className="font-semibold text-gray-900 text-sm">
                  Customer
                </h3>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  {order.user?.accountInfo?.firstName}{" "}
                  {order.user?.accountInfo?.lastName}
                </p>
                <p className="text-gray-500 text-xs">{order.user?.email}</p>
                {order.user?.phone && (
                  <p className="text-gray-500 text-xs">{order.user.phone}</p>
                )}
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="bg-white rounded-2xl border border-gray-200 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-gray-500" />
                <h3 className="font-semibold text-gray-900 text-sm">
                  Shipping Address
                </h3>
              </div>
              <div className="space-y-0.5 text-sm">
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
                <p className="text-gray-500 text-xs">
                  Phone: {order.shippingAddress?.phone}
                </p>
              </div>
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="bg-white rounded-2xl border border-gray-200 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={16} className="text-gray-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Payment</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">Method:</span>{" "}
                  {order.payment?.method?.replace(/_/g, " ")}
                </p>
                <p>
                  <span className="text-gray-500">Status:</span>{" "}
                  <span
                    className={cn(
                      "inline-block px-1.5 py-0.5 rounded-full text-xs font-medium",
                      PAYMENT_STATUS_COLORS[order.payment?.status] ||
                        "bg-gray-100 text-gray-600",
                    )}
                  >
                    {order.payment?.status || "N/A"}
                  </span>
                </p>
                {order.payment?.paidAt && (
                  <p className="text-xs text-gray-500">
                    Paid: {formatDate(order.payment.paidAt)}
                  </p>
                )}
                {order.payment?.refundedAmount > 0 && (
                  <p className="text-xs text-gray-500">
                    Refunded: {formatBDT(Number(order.payment.refundedAmount))}
                  </p>
                )}
                {order.payment?.transactionId && (
                  <p className="text-xs text-gray-500 font-mono">
                    TxID: {order.payment.transactionId}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Shipment Info (if exists) */}
            {order.shipment && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="bg-white rounded-2xl border border-gray-200 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Truck size={16} className="text-gray-500" />
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Shipment
                  </h3>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-500">Carrier:</span>{" "}
                    {order.shipment.carrier}
                  </p>
                  <p>
                    <span className="text-gray-500">Tracking:</span>{" "}
                    {order.shipment.trackingNumber}
                  </p>
                  {order.shipment.trackingUrl && (
                    <p>
                      <a
                        href={order.shipment.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
                      >
                        Track <LinkIcon size={10} />
                      </a>
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Shipped: {formatDate(order.shipment.shippedAt)}
                  </p>
                  {order.shipment.deliveredAt && (
                    <p className="text-xs text-gray-500">
                      Delivered: {formatDate(order.shipment.deliveredAt)}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (1/3 width) – Timeline + Actions */}
        <div className="space-y-5">
          {/* Timeline Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/30">
              <History size={16} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900 text-sm">
                Order Timeline
              </h3>
            </div>
            <div className="p-4 max-h-[320px] overflow-y-auto">
              {timeline.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">No history</p>
              ) : (
                <div className="relative pl-5 space-y-3">
                  {timeline.map((event: any, idx: number) => {
                    const isLast = idx === timeline.length - 1;
                    const statusColor =
                      STATUS_COLORS[event.status]?.split(" ")[0] ||
                      "bg-gray-500";
                    return (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute left-0 top-1 w-2 h-2 rounded-full ${statusColor} ring-2 ring-white`}
                        ></div>
                        {!isLast && (
                          <div className="absolute left-0.5 top-3 w-0.5 h-full bg-gray-200"></div>
                        )}
                        <div className="ml-5">
                          <div className="flex flex-wrap items-baseline gap-1">
                            <span className="text-xs font-semibold text-gray-900">
                              {event.status.replace(/_/g, " ")}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {formatDate(event.createdAt)}
                            </span>
                          </div>
                          {event.note && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {event.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Actions Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 p-4"
          >
            <h3 className="font-semibold text-gray-900 text-sm mb-3">
              Actions
            </h3>
            <div className="space-y-2">
              {allowedNextStatuses.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Update Status
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {allowedNextStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(status)}
                        disabled={updating}
                        className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary hover:text-white transition disabled:opacity-50"
                      >
                        {status.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {canCreateShipment && (
                <button
                  onClick={openShipmentModal}
                  disabled={updating}
                  className="w-full py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  Create Shipment
                </button>
              )}
              {isCancellable && (
                <button
                  onClick={handleCancelOrder}
                  disabled={updating}
                  className="w-full py-1.5 rounded-lg border border-red-300 text-red-600 text-xs font-medium hover:bg-red-50 transition disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Create Shipment Modal */}
      {shipmentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShipmentModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">Create Shipment</h3>
              <button
                onClick={() => setShipmentModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <XCircle size={18} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Carrier *
                </label>
                <select
                  name="carrier"
                  value={shipmentForm.carrier}
                  onChange={handleShipmentFormChange}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm"
                >
                  <option value="">Select carrier</option>
                  <option value="Steadfast">Steadfast</option>
                  <option value="Paperfly">Paperfly</option>
                  <option value="RedX">RedX</option>
                  <option value="Sundarban">Sundarban</option>
                  <option value="SA Paribahan">SA Paribahan</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tracking Number *
                </label>
                <input
                  type="text"
                  name="trackingNumber"
                  value={shipmentForm.trackingNumber}
                  onChange={handleShipmentFormChange}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Auto-generated based on carrier
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tracking URL (optional)
                </label>
                <input
                  type="url"
                  name="trackingUrl"
                  value={shipmentForm.trackingUrl}
                  onChange={handleShipmentFormChange}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Estimated Delivery (optional)
                </label>
                <input
                  type="date"
                  name="estimatedAt"
                  value={shipmentForm.estimatedAt}
                  onChange={handleShipmentFormChange}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setShipmentModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateShipment}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
