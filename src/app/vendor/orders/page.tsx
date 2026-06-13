/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShoppingCart,
  ChevronRight,
  Search,
  Filter,
  X,
  DollarSign,
  Package,
  TrendingUp,
  RefreshCw,
  Clock,
  XCircle,
  CheckSquare,
  Square,
  Truck,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  getMyVendorOrders,
  updateOrderStatus,
  cancelOrder,
  updateOrderStatusBulk,
} from "@/services/order.service";
import {
  createSteadfastShipments,
  createShipment,
} from "@/services/shipment.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Image from "next/image";

const STATUS_TABS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "REFUNDED",
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-purple-50 text-purple-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  RETURN_REQUESTED: "bg-pink-50 text-pink-700",
  RETURNED: "bg-gray-50 text-gray-700",
  REFUNDED: "bg-gray-50 text-gray-700",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  INITIATED: "bg-blue-50 text-blue-700",
  SUCCESS: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-50 text-gray-700",
  REFUNDED: "bg-purple-50 text-purple-700",
};

// Full status transition map
const isValidStatusTransition = (current: string, next: string): boolean => {
  const transitions: Record<string, string[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PROCESSING", "SHIPPED", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"],
    OUT_FOR_DELIVERY: ["DELIVERED"],
    DELIVERED: ["RETURN_REQUESTED"],
    RETURN_REQUESTED: ["RETURNED", "DELIVERED"],
    RETURNED: ["REFUNDED"],
    CANCELLED: [],
    REFUNDED: [],
  };
  return transitions[current]?.includes(next) ?? false;
};

// Helper to get allowed next statuses for a given current status
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

// Generate random tracking number based on carrier
const generateTrackingNumber = (carrier: string): string => {
  const prefix = carrier.slice(0, 2).toUpperCase();
  const randomNum = Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, "0");
  return `${prefix}-${randomNum}`;
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<any>(null);
  const [statusBreakdown, setStatusBreakdown] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Single shipment modal
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
  const [shipmentOrderId, setShipmentOrderId] = useState<number | null>(null);
  const [shipmentForm, setShipmentForm] = useState({
    carrier: "",
    trackingNumber: "",
    trackingUrl: "",
    estimatedAt: "",
  });

  // Bulk shipment modal
  const [bulkShipmentModalOpen, setBulkShipmentModalOpen] = useState(false);
  const [bulkShipmentMethod, setBulkShipmentMethod] = useState<
    "manual" | "steadfast"
  >("manual");
  const [bulkShipmentForm, setBulkShipmentForm] = useState({
    carrier: "",
    trackingNumber: "",
    trackingUrl: "",
    estimatedAt: "",
  });

  const limit = 15;

  const load = async () => {
    setLoading(true);
    const params: any = {
      page,
      limit,
      status: activeTab === "ALL" ? undefined : activeTab,
      search: search || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
    };
    const res = await getMyVendorOrders(params);
    if (res?.success) {
      const data = res.data;
      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
      setSummary(data.summary);
      setStatusBreakdown(data.statusBreakdown);
    }
    setLoading(false);
    setSelectedOrders(new Set());
  };

  useEffect(() => {
    setPage(1);
    load();
  }, [activeTab, search, dateFrom, dateTo, minAmount, maxAmount]);

  useEffect(() => {
    load();
  }, [page]);

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setMinAmount("");
    setMaxAmount("");
    setActiveTab("ALL");
    setShowFilters(false);
  };

  const activeFilterCount = () => {
    let count = 0;
    if (search) count++;
    if (dateFrom || dateTo) count++;
    if (minAmount || maxAmount) count++;
    if (activeTab !== "ALL") count++;
    return count;
  };

  const toggleSelectOrder = (orderId: number) => {
    const newSet = new Set(selectedOrders);
    if (newSet.has(orderId)) {
      newSet.delete(orderId);
    } else {
      newSet.add(orderId);
    }
    setSelectedOrders(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o.id)));
    }
  };

  // Single order status update
  const handleStatusUpdate = async (
    orderId: number,
    currentStatus: string,
    newStatus: string,
  ) => {
    if (!isValidStatusTransition(currentStatus, newStatus)) {
      toast.error(`Cannot move from ${currentStatus} to ${newStatus}`);
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
        <p class="text-xs text-gray-400 mt-1">Check this if the order payment has been successfully collected.</p>
      </div>
    `;
    }
    modalHtml += `</div>`;

    const result = await Swal.fire({
      title: "Change Order Status?",
      html: modalHtml,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#ffffff",
      color: "#111827",
      confirmButtonColor: "#7C3AED",
      cancelButtonColor: "#F3F4F6",
      customClass: {
        popup: "rounded-3xl border border-gray-100 shadow-2xl px-2",
        title: "text-lg font-bold text-gray-900",
        htmlContainer: "text-sm text-gray-500",
        confirmButton:
          "bg-primary text-white px-5 py-2.5 ml-2 rounded-xl cursor-pointer font-medium hover:opacity-90 transition",
        cancelButton:
          "bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition cursor-pointer",
      },
      buttonsStyling: false,
      preConfirm: () => {
        if (newStatus === "DELIVERED") {
          const checkbox = document.getElementById(
            "paymentReceivedCheckbox",
          ) as HTMLInputElement;
          return { isPaymentReceived: checkbox?.checked || false };
        }
        return {};
      },
    });

    if (!result.isConfirmed) return;

    try {
      const payload: any = {
        status: newStatus,
        note: `Order status changed to ${newStatus} by vendor`,
      };
      if (
        newStatus === "DELIVERED" &&
        result.value?.isPaymentReceived === true
      ) {
        payload.isPaymentReceived = true;
      }
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      const res = await updateOrderStatus(orderId, formData);
      if (res?.success) {
        toast.success(`Order moved to ${newStatus}`);
        load();
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  // Single order cancellation
  const handleCancelOrder = async (orderId: number) => {
    const { value: reason } = await Swal.fire({
      title: "Cancel Order",
      input: "textarea",
      inputLabel: "Cancellation reason",
      inputPlaceholder: "Enter the reason for cancellation...",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel",
      cancelButtonText: "Back",
      inputValidator: (value) => {
        if (!value) return "Reason is required!";
        return null;
      },
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "bg-red-600 text-white px-5 py-2.5 rounded-xl",
        cancelButton: "bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl",
      },
      buttonsStyling: false,
    });
    if (!reason) return;

    try {
      const payload = { cancelReason: reason };
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      const res = await cancelOrder(orderId, formData);
      if (res?.success) {
        toast.success(`Order #${orderId} cancelled`);
        load();
      } else {
        toast.error(res?.message || "Failed to cancel order");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  // Bulk update to a specific status (for selected orders)
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.size === 0) return;
    let modalHtml = `
  <div class="text-left">
    <p class="text-sm text-gray-600 mb-2">
      Move ${selectedOrders.size} order(s) to ${newStatus}?
    </p>
`;

    if (newStatus === "DELIVERED") {
      modalHtml += `
    <div class="mt-3 pt-2 border-t border-gray-100">
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          id="paymentReceivedCheckbox"
          class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
        >
        <span class="text-sm text-gray-700">
          Payment received from customer
        </span>
      </label>

      <p class="text-xs text-gray-400 mt-1">
        Check this if payment has been successfully collected.
      </p>
    </div>
  `;
    }

    modalHtml += `</div>`;

    const result = await Swal.fire({
      title: "Bulk Status Update",
      html: modalHtml,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#ffffff",
      color: "#111827",
      confirmButtonColor: "#7C3AED",
      cancelButtonColor: "#F3F4F6",
      customClass: {
        popup: "rounded-3xl border border-gray-100 shadow-2xl px-2",
        title: "text-lg font-bold text-gray-900",
        htmlContainer: "text-sm text-gray-500",
        confirmButton:
          "bg-primary text-white px-5 py-2.5 ml-2 rounded-xl cursor-pointer font-medium hover:opacity-90 transition",
        cancelButton:
          "bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition cursor-pointer",
      },
      buttonsStyling: false,
      preConfirm: () => {
        if (newStatus === "DELIVERED") {
          const checkbox = document.getElementById(
            "paymentReceivedCheckbox",
          ) as HTMLInputElement;

          return {
            isPaymentReceived: checkbox?.checked || false,
          };
        }

        return {};
      },
    });

    if (!result.isConfirmed) return;

    setBulkActionLoading(true);
    try {
      const payload: any = {
        orderIds: Array.from(selectedOrders),
        status: newStatus,
        note: `Bulk moved to ${newStatus} by vendor`,
      };

      if (
        newStatus === "DELIVERED" &&
        result.value?.isPaymentReceived === true
      ) {
        payload.isPaymentReceived = true;
      }
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      const res = await updateOrderStatusBulk(formData);
      if (res?.success) {
        const responseData = res.data || res;
        const { successCount, failedCount, skippedCount, failed, skipped } =
          responseData;

        if (successCount > 0) {
          toast.success(`${successCount} order(s) moved to ${newStatus}`);
        }
        if (failedCount > 0) {
          toast.warning(`${failedCount} order(s) failed`);
        }
        if (skippedCount > 0) {
          toast.info(`${skippedCount} order(s) were skipped`);
        }

        if (failedCount > 0 || skippedCount > 0) {
          let htmlContent = `
            <div class="text-left max-h-96 overflow-y-auto">
              ${
                failedCount > 0
                  ? `
                <div class="mb-4">
                  <h4 class="font-semibold text-red-600 mb-2">Failed (${failedCount})</h4>
                  <table class="w-full text-sm border-collapse">
                    <thead>
                      <tr class="border-b">
                        <th class="text-left py-1">Order #</th>
                        <th class="text-left py-1">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${failed
                        .map(
                          (f: any) => `
                        <tr class="border-b">
                          <td class="py-1">${f.orderNumber || f.orderId}</td>
                          <td class="py-1 text-red-500">${
                            f.error || "Failed"
                          }</td>
                        </tr>
                      `,
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
                  : ""
              }
              ${
                skippedCount > 0
                  ? `
                <div>
                  <h4 class="font-semibold text-yellow-600 mb-2">Skipped (${skippedCount})</h4>
                  <table class="w-full text-sm border-collapse">
                    <thead>
                      <tr class="border-b">
                        <th class="text-left py-1">Order #</th>
                        <th class="text-left py-1">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${skipped
                        .map(
                          (s: any) => `
                        <tr class="border-b">
                          <td class="py-1">${s.orderNumber || s.orderId}</td>
                          <td class="py-1 text-yellow-600">${
                            s.reason || "Skipped"
                          }</td>
                        </tr>
                      `,
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
                  : ""
              }
            </div>
          `;
          await Swal.fire({
            title: "Bulk Update Results",
            html: htmlContent,
            icon: "info",
            confirmButtonText: "OK",
            customClass: {
              popup: "rounded-3xl max-w-2xl",
              confirmButton: "bg-primary text-white px-5 py-2.5 rounded-xl",
            },
            buttonsStyling: false,
          });
        } else {
          await Swal.fire({
            title: "Success!",
            text: `All ${successCount} order(s) moved to ${newStatus}`,
            icon: "success",
            confirmButtonText: "OK",
            customClass: {
              popup: "rounded-3xl",
              confirmButton: "bg-primary text-white px-5 py-2.5 rounded-xl",
            },
            buttonsStyling: false,
          });
        }
      } else {
        toast.error(res?.message || "Bulk update failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBulkActionLoading(false);
      setSelectedOrders(new Set());
      load();
    }
  };

  // Helper to get common next status for selected orders (exclude SHIPPED)
  const getCommonNextStatus = (selectedOrdersList: any[]): string | null => {
    if (selectedOrdersList.length === 0) return null;
    let commonSet = new Set(
      getAllowedNextStatuses(selectedOrdersList[0].status),
    );
    for (let i = 1; i < selectedOrdersList.length; i++) {
      const nextSet = new Set(
        getAllowedNextStatuses(selectedOrdersList[i].status),
      );
      commonSet = new Set([...commonSet].filter((s) => nextSet.has(s)));
      if (commonSet.size === 0) break;
    }
    if (commonSet.size === 0) return null;
    // Return first common status (we'll filter SHIPPED later)
    return Array.from(commonSet)[0];
  };

  const canBulkCreateShipment = (selectedOrdersList: any[]): boolean => {
    if (selectedOrdersList.length === 0) return false;
    return selectedOrdersList.every(
      (order) => order.status === "CONFIRMED" || order.status === "PROCESSING",
    );
  };

  // Single shipment modal handlers
  const openShipmentModal = (orderId: number) => {
    setShipmentOrderId(orderId);
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
      const generated = generateTrackingNumber(value);
      setShipmentForm((prev) => ({ ...prev, trackingNumber: generated }));
    }
  };

  const handleCreateShipment = async () => {
    if (!shipmentOrderId) return;
    if (!shipmentForm.carrier || !shipmentForm.trackingNumber) {
      toast.error("Carrier and tracking number are required");
      return;
    }
    try {
      const payload = {
        orderId: shipmentOrderId,
        carrier: shipmentForm.carrier,
        trackingNumber: shipmentForm.trackingNumber,
        trackingUrl: shipmentForm.trackingUrl || undefined,
        estimatedAt: shipmentForm.estimatedAt || undefined,
      };
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      const res = await createShipment(formData);
      if (res?.success) {
        toast.success(`Shipment created for order #${shipmentOrderId}`);
        setShipmentModalOpen(false);
        load();
      } else {
        toast.error(res?.message || "Failed to create shipment");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  // Bulk shipment modal handlers
  const openBulkShipmentModal = () => {
    if (selectedOrders.size === 0) {
      toast.error("Select at least one order to create shipments");
      return;
    }
    setBulkShipmentMethod("manual");
    setBulkShipmentForm({
      carrier: "",
      trackingNumber: "",
      trackingUrl: "",
      estimatedAt: "",
    });
    setBulkShipmentModalOpen(true);
  };

  const handleBulkShipmentFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setBulkShipmentForm((prev) => ({ ...prev, [name]: value }));
    if (name === "carrier" && value) {
      const generated = generateTrackingNumber(value);
      setBulkShipmentForm((prev) => ({ ...prev, trackingNumber: generated }));
    }
  };

  const handleBulkCreateShipment = async () => {
    setBulkActionLoading(true);
    try {
      if (bulkShipmentMethod === "steadfast") {
        const payload = { orderIds: Array.from(selectedOrders) };
        const formData = new FormData();
        formData.append("data", JSON.stringify(payload));
        const res = await createSteadfastShipments(formData);
        if (res?.success) {
          toast.success(`${res.successCount} order(s) sent to Steadfast`);
          if (res.failedCount > 0)
            toast.warning(`${res.failedCount} order(s) failed`);
        } else {
          toast.error(res?.message || "Steadfast bulk shipment failed");
        }
      } else {
        if (!bulkShipmentForm.carrier || !bulkShipmentForm.trackingNumber) {
          toast.error(
            "Carrier and tracking number are required for manual shipments",
          );
          return;
        }
        const promises = Array.from(selectedOrders).map((orderId) => {
          const payload = {
            orderId,
            carrier: bulkShipmentForm.carrier,
            trackingNumber: bulkShipmentForm.trackingNumber,
            trackingUrl: bulkShipmentForm.trackingUrl || undefined,
            estimatedAt: bulkShipmentForm.estimatedAt || undefined,
          };
          const formData = new FormData();
          formData.append("data", JSON.stringify(payload));
          return createShipment(formData);
        });
        const results = await Promise.allSettled(promises);
        const succeeded = results.filter(
          (r) => r.status === "fulfilled" && (r.value as any)?.success,
        ).length;
        toast.success(`${succeeded} shipment(s) created successfully`);
        if (succeeded !== selectedOrders.size) {
          toast.warning(
            `${selectedOrders.size - succeeded} shipment(s) failed`,
          );
        }
      }
      setBulkShipmentModalOpen(false);
      setSelectedOrders(new Set());
      load();
    } catch (err: any) {
      toast.error(err.message || "Bulk shipment creation failed");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Helper to get product image & quantity summary for row
  const getOrderItemsPreview = (order: any) => {
    const items = order.items || [];
    const firstItem = items[0];
    const imageUrl = firstItem?.product?.images?.[0]?.url || null;
    const totalQty = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
    const variantNames = items
      .map((i: any) => i.variant?.name)
      .filter(Boolean)
      .join(", ");
    return { imageUrl, totalQty, variantNames };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Orders
        </h2>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.totalOrders}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Package size={20} className="text-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatBDT(Number(summary.totalRevenue))}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <DollarSign size={20} className="text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Order Value</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {formatBDT(Number(summary.averageOrderValue))}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-purple-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {summary.pendingOrders}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock size={20} className="text-amber-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200",
            showFilters
              ? "bg-primary text-white border-primary"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
          )}
        >
          <Filter size={16} /> Filters
          {activeFilterCount() > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount()}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    placeholder="Any"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Action Bar with Animation */}
      {selectedOrders.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-primary/5 rounded-xl p-3 flex items-center justify-between border border-primary/20 flex-wrap gap-2"
        >
          <div className="flex items-center gap-2">
            <CheckSquare size={18} className="text-primary" />
            <span className="text-sm font-medium text-gray-700">
              {selectedOrders.size} order(s) selected
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(() => {
              const selectedOrdersList = orders.filter((o) =>
                selectedOrders.has(o.id),
              );
              const commonNextStatus = getCommonNextStatus(selectedOrdersList);
              const showShipmentBtn = canBulkCreateShipment(selectedOrdersList);
              return (
                <>
                  {commonNextStatus && commonNextStatus !== "SHIPPED" && (
                    <button
                      onClick={() => handleBulkStatusUpdate(commonNextStatus)}
                      disabled={bulkActionLoading}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {commonNextStatus === "CONFIRMED"
                        ? "Confirm Selected"
                        : `Move to ${commonNextStatus}`}
                    </button>
                  )}
                  {showShipmentBtn && (
                    <button
                      onClick={openBulkShipmentModal}
                      disabled={bulkActionLoading}
                      className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      Create Shipments
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrders(new Set())}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-xs hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </>
              );
            })()}
          </div>
        </motion.div>
      )}

      {/* Status Tabs with Counts */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {STATUS_TABS.map((tab) => {
          const count =
            tab === "ALL" ? summary?.totalOrders : statusBreakdown?.[tab];
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5",
                activeTab === tab
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary",
              )}
            >
              {tab === "ALL"
                ? "All"
                : tab.charAt(0) + tab.slice(1).toLowerCase()}
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    "text-[10px] rounded-full px-1.5 py-0.5",
                    activeTab === tab
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center text-center gap-4">
          <ShoppingCart size={48} className="text-gray-200" />
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="w-10 px-4 py-3">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-500 hover:text-primary"
                    >
                      {selectedOrders.size === orders.length &&
                      orders.length > 0 ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                    Order #
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                    Products
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                    Total
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                    Payment
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const { imageUrl, totalQty, variantNames } =
                    getOrderItemsPreview(order);
                  const allowedNext = getAllowedNextStatuses(order.status);
                  const canCreateShipment =
                    order.status === "CONFIRMED" ||
                    order.status === "PROCESSING";
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={cn(
                        "border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer",
                        selectedOrders.has(order.id) && "bg-primary/5",
                      )}
                      onClick={(e) => {
                        if (
                          (e.target as HTMLElement).closest(
                            "button, select, a, input",
                          )
                        )
                          return;
                        window.location.href = `/vendor/orders/${order.id}`;
                      }}
                    >
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => toggleSelectOrder(order.id)}
                          className="text-gray-500 hover:text-primary"
                        >
                          {selectedOrders.has(order.id) ? (
                            <CheckSquare size={16} className="text-primary" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">
                          #{order.orderNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt="product"
                              className="w-8 h-8 rounded object-cover"
                              height={32}
                              width={32}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                              <Package size={14} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-700">
                              {totalQty} item(s)
                            </p>
                            {variantNames && (
                              <p className="text-xs text-gray-400 truncate max-w-37.5">
                                {variantNames}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-primary">
                          {formatBDT(Number(order.total))}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium w-fit",
                              PAYMENT_STATUS_COLORS[order.payment?.status] ||
                                "bg-gray-50 text-gray-600",
                            )}
                          >
                            {order.payment?.status || "N/A"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {order.payment?.method?.replace(/_/g, " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            STATUS_COLORS[order.status] ||
                              "bg-gray-50 text-gray-600",
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-1.5 flex-wrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {allowedNext.length > 0 && (
                            <div className="relative group">
                              <select
                                className="text-xs border rounded-lg px-2 py-1 bg-white cursor-pointer"
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  if (newStatus)
                                    handleStatusUpdate(
                                      order.id,
                                      order.status,
                                      newStatus,
                                    );
                                  e.target.value = "";
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled>
                                  Change to...
                                </option>
                                {allowedNext.map((status) => (
                                  <option key={status} value={status}>
                                    {status.replace(/_/g, " ")}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          {order.status !== "CANCELLED" &&
                            order.status !== "DELIVERED" && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Cancel Order"
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                          {canCreateShipment && (
                            <button
                              onClick={() => openShipmentModal(order.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Create Shipment"
                            >
                              <Truck size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {total} total orders
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40 hover:border-primary"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = page;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={cn(
                          "w-7 h-7 rounded-lg text-xs transition-colors",
                          page === pageNum
                            ? "bg-primary text-white"
                            : "text-gray-600 hover:bg-gray-100",
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40 hover:border-primary"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Single Shipment Modal */}
      {shipmentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShipmentModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold text-gray-900">Create Shipment</h3>
              <button
                onClick={() => setShipmentModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Carrier *
                </label>
                <select
                  name="carrier"
                  value={shipmentForm.carrier}
                  onChange={handleShipmentFormChange}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200"
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
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200"
                  placeholder="Auto-generated"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Suggestion based on carrier
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
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200"
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
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t">
              <button
                onClick={() => setShipmentModalOpen(false)}
                className="px-4 py-2 rounded-xl border"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateShipment}
                className="px-4 py-2 rounded-xl bg-primary text-white"
              >
                Create Shipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Shipment Modal */}
      {bulkShipmentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setBulkShipmentModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold text-gray-900">
                Bulk Create Shipments
              </h3>
              <button
                onClick={() => setBulkShipmentModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                Creating shipments for {selectedOrders.size} order(s)
              </p>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Shipping Method
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkShipMethod"
                      value="manual"
                      checked={bulkShipmentMethod === "manual"}
                      onChange={() => setBulkShipmentMethod("manual")}
                      className="text-primary"
                    />
                    <span className="text-sm">Manual</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkShipMethod"
                      value="steadfast"
                      checked={bulkShipmentMethod === "steadfast"}
                      onChange={() => setBulkShipmentMethod("steadfast")}
                      className="text-primary"
                    />
                    <span className="text-sm">Steadfast (Auto)</span>
                  </label>
                </div>
              </div>
              {bulkShipmentMethod === "manual" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Carrier *
                    </label>
                    <select
                      name="carrier"
                      value={bulkShipmentForm.carrier}
                      onChange={handleBulkShipmentFormChange}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200"
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
                      value={bulkShipmentForm.trackingNumber}
                      onChange={handleBulkShipmentFormChange}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200"
                      placeholder="Auto-generated"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Tracking URL (optional)
                    </label>
                    <input
                      type="url"
                      name="trackingUrl"
                      value={bulkShipmentForm.trackingUrl}
                      onChange={handleBulkShipmentFormChange}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Estimated Delivery (optional)
                    </label>
                    <input
                      type="date"
                      name="estimatedAt"
                      value={bulkShipmentForm.estimatedAt}
                      onChange={handleBulkShipmentFormChange}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200"
                    />
                  </div>
                </>
              )}
              {bulkShipmentMethod === "steadfast" && (
                <div className="bg-blue-50 p-3 rounded-xl text-sm text-blue-700">
                  Orders will be sent to Steadfast for bulk processing. Tracking
                  numbers will be generated by Steadfast.
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t">
              <button
                onClick={() => setBulkShipmentModalOpen(false)}
                className="px-4 py-2 rounded-xl border"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkCreateShipment}
                disabled={bulkActionLoading}
                className="px-4 py-2 rounded-xl bg-primary text-white disabled:opacity-50"
              >
                Create {selectedOrders.size} Shipment(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
