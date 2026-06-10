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
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Ban,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  getMyVendorOrders,
  updateOrderStatus,
  cancelOrder,
} from "@/services/order.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

const STATUS_TABS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-purple-50 text-purple-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
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
    setSelectedOrders(new Set()); // clear selection on new data
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

  // Selection handlers
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

  // Action handlers
  const handleConfirmOrder = async (orderId: number) => {
    try {
      const formData = new FormData();
      formData.append("status", "CONFIRMED");
      formData.append("note", "Order confirmed by vendor");
      const res = await updateOrderStatus(orderId, formData);
      if (res?.success) {
        toast.success(`Order #${orderId} confirmed`);
        load();
      } else {
        toast.error(res?.message || "Failed to confirm order");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;
    try {
      const res = await cancelOrder(orderId, reason);
      if (res?.success) {
        toast.success(`Order #${orderId} cancelled`);
        load();
      } else {
        toast.error(res?.message || "Failed to cancel order");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleBulkConfirm = async () => {
    if (selectedOrders.size === 0) return;
    if (!confirm(`Confirm ${selectedOrders.size} order(s)?`)) return;
    setBulkActionLoading(true);
    const promises = Array.from(selectedOrders).map((orderId) => {
      const formData = new FormData();
      formData.append("status", "CONFIRMED");
      formData.append("note", "Bulk confirmed by vendor");
      return updateOrderStatus(orderId, formData);
    });
    const results = await Promise.allSettled(promises);
    const succeeded = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any)?.success,
    ).length;
    toast.success(`${succeeded} order(s) confirmed successfully`);
    if (succeeded !== selectedOrders.size) {
      toast.warning(`${selectedOrders.size - succeeded} order(s) failed`);
    }
    setBulkActionLoading(false);
    setSelectedOrders(new Set());
    load();
  };

  const handleBulkCancel = async () => {
    if (selectedOrders.size === 0) return;
    const reason = prompt(
      `Enter cancellation reason for ${selectedOrders.size} order(s):`,
    );
    if (!reason) return;
    if (!confirm(`Cancel ${selectedOrders.size} order(s)?`)) return;
    setBulkActionLoading(true);
    const promises = Array.from(selectedOrders).map((orderId) =>
      cancelOrder(orderId, reason),
    );
    const results = await Promise.allSettled(promises);
    const succeeded = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any)?.success,
    ).length;
    toast.success(`${succeeded} order(s) cancelled successfully`);
    if (succeeded !== selectedOrders.size) {
      toast.warning(`${selectedOrders.size - succeeded} order(s) failed`);
    }
    setBulkActionLoading(false);
    setSelectedOrders(new Set());
    load();
  };

  // Check which orders are actionable (only PENDING can be confirmed/cancelled by vendor)
  const isActionable = (status: string) => status === "PENDING";

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

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number or customer..."
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
          <Filter size={16} />
          <span className="text-sm font-medium">Filters</span>
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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

      {/* Bulk Action Bar */}
      {selectedOrders.size > 0 && (
        <div className="bg-primary/5 rounded-xl p-3 flex items-center justify-between border border-primary/20">
          <div className="flex items-center gap-2">
            <CheckSquare size={18} className="text-primary" />
            <span className="text-sm font-medium text-gray-700">
              {selectedOrders.size} order(s) selected
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkConfirm}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
            >
              Confirm All
            </button>
            <button
              onClick={handleBulkCancel}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
            >
              Cancel All
            </button>
            <button
              onClick={() => setSelectedOrders(new Set())}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-xs hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center text-center gap-4">
          <ShoppingCart size={48} className="text-gray-200" />
          <p className="text-gray-500">No orders found.</p>
          {(activeFilterCount() > 0 || activeTab !== "ALL") && (
            <button
              onClick={clearFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
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
                      className="text-gray-500 hover:text-primary transition-colors"
                    >
                      {selectedOrders.size === orders.length &&
                      orders.length > 0 ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  {[
                    "Order #",
                    "Customer",
                    "Items",
                    "Total",
                    "Payment",
                    "Status",
                    "Date",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-500 px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors",
                      selectedOrders.has(order.id) && "bg-primary/5",
                    )}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSelectOrder(order.id)}
                        className="text-gray-500 hover:text-primary transition-colors"
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
                      <p className="text-sm text-gray-700">
                        {order.user?.accountInfo?.firstName}{" "}
                        {order.user?.accountInfo?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.user?.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {order.items?.length ?? 0} item(s)
                      </span>
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
                        {order.createdAt ? formatDate(order.createdAt) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/vendor/orders/${order.id}`}
                          className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                          title="View Details"
                        >
                          <ChevronRight size={14} />
                        </Link>
                        {isActionable(order.status) && (
                          <>
                            <button
                              onClick={() => handleConfirmOrder(order.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Confirm Order"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel Order"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
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
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
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
    </div>
  );
}
