/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Package,
  Search,
  Truck,
  PackageCheck,
  Star,
  Eye,
  Calendar,
  CreditCard,
} from "lucide-react";
import { getMyOrders } from "@/services/order.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

// ─── Status config ──────────────────────────────────────────────
const STATUS_META: Record<
  string,
  { color: string; bg: string; border: string; label: string }
> = {
  PENDING: {
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    label: "Pending",
  },
  CONFIRMED: {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    label: "Confirmed",
  },
  PROCESSING: {
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    label: "Processing",
  },
  SHIPPED: {
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    label: "Shipped",
  },
  DELIVERED: {
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    label: "Delivered",
  },
  CANCELLED: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Cancelled",
  },
  RETURNED: {
    color: "text-gray-700",
    bg: "bg-gray-50",
    border: "border-gray-200",
    label: "Returned",
  },
};

type FilterKey = "ALL" | "TO_PAY" | "TO_SHIP" | "TO_RECEIVE" | "TO_REVIEW";

const TABS: { key: FilterKey; label: string; icon: any; gradient: string }[] = [
  {
    key: "ALL",
    label: "All Orders",
    icon: Package,
    gradient: "from-gray-500 to-gray-600",
  },
  {
    key: "TO_PAY",
    label: "To Pay",
    icon: CreditCard,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    key: "TO_SHIP",
    label: "To Ship",
    icon: Truck,
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    key: "TO_RECEIVE",
    label: "To Receive",
    icon: PackageCheck,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    key: "TO_REVIEW",
    label: "To Review",
    icon: Star,
    gradient: "from-pink-500 to-rose-500",
  },
];

// ─── Main Component ──────────────────────────────────────────────
export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyOrders({
        page,
        limit,
        filter: filter === "ALL" ? undefined : filter,
        includeCounts: true,
      });
      if (res?.success) {
        setOrders(res.data?.orders ?? []);
        setTotal(res.data?.total ?? 0);
        setCounts(res.data?.counts ?? null);
      }
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter, page]);

  const filteredBySearch = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.items?.some((item: any) =>
          item.snapshot?.productName?.toLowerCase().includes(q),
        ),
    );
  }, [orders, search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold bg-linear-to-r from-primary to-orange-400 bg-clip-text text-transparent">
            My Orders
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Track and manage all your purchases
          </p>
        </div>
        {counts && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
            <Package size={12} className="text-primary" />
            <span>{counts.ALL} orders total</span>
          </div>
        )}
      </div>

      {/* ─── Search ─── */}
      <div className="relative group">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
        />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by order number or product..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-white shadow-sm"
        />
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map((tab) => {
          const isActive = filter === tab.key;
          const count = counts?.[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setFilter(tab.key);
                setPage(1);
              }}
              className={cn(
                "group relative shrink-0 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                isActive
                  ? "text-white shadow-lg shadow-primary/20 bg-primary-dark"
                  : "bg-white/70 backdrop-blur-sm border border-gray-200/60 text-gray-600 hover:border-primary/30 hover:shadow-sm",
              )}
            >
              <tab.icon
                size={14}
                className={isActive ? "text-white" : "text-gray-400"}
              />
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600",
                  )}
                >
                  {count}
                </span>
              )}
              {!isActive && (
                <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-primary/20 transition-colors" />
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Orders List ─── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="skeleton h-20 rounded-2xl bg-linear-to-r from-gray-100/60 to-gray-50/60"
              />
            ))}
          </div>
        ) : filteredBySearch.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card p-16 flex flex-col items-center text-center gap-4 bg-white/60 backdrop-blur-sm border-2 border-dashed border-gray-200 rounded-3xl"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Package size={32} className="text-primary/60" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                No orders found
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {search
                  ? "Try adjusting your search"
                  : "Start shopping to see your orders here"}
              </p>
            </div>
            <Link
              href="/products"
              className="btn-primary px-8 py-2.5 text-sm mt-2"
            >
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <motion.div className="space-y-3">
            {filteredBySearch.map((order, i) => {
              const items = order.items || [];
              const totalItems = order._count?.items ?? items.length;
              const statusMeta =
                STATUS_META[order.status] || STATUS_META.PENDING;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -2 }}
                  className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex items-center justify-between"
                >
                  {/* ── Left Section ── */}
                  <div className="flex items-center gap-8 justify-start flex-1 min-w-0">
                    {/* Order Number & Status */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex gap-3">
                        <span className="font-display font-bold text-gray-900 text-sm tracking-tight">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full border font-medium flex justify-center items-center text-center gap-1",
                            statusMeta.bg,
                            statusMeta.border,
                            statusMeta.color,
                          )}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          {statusMeta.label}
                        </span>
                      </div>
                    </div>

                    {/* Product Previews */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {items.slice(0, 3).map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="w-9 h-9 rounded-xl bg-linear-to-br from-gray-50 to-gray-100 border border-gray-200/50 flex items-center justify-center text-gray-400 overflow-hidden shadow-sm"
                        >
                          {item.snapshot?.productName ? (
                            <span className="text-[8px] font-bold text-gray-500 uppercase">
                              {item.snapshot.productName.slice(0, 2)}
                            </span>
                          ) : (
                            <Package size={12} />
                          )}
                        </div>
                      ))}
                      {totalItems > 3 && (
                        <div className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          +{totalItems - 3}
                        </div>
                      )}
                    </div>

                    {/* Date & Total */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-300" />
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="font-display font-bold text-primary text-sm">
                        {formatBDT(order.total ?? 0)}
                      </span>
                    </div>
                  </div>

                  {/* ── Right: View Button ── */}
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="p-2 rounded-xl text-primary/60 hover:text-primary hover:bg-primary/5 transition-all duration-200 group-hover:bg-primary/5"
                    title="View order details"
                  >
                    <Eye size={16} />
                    <span className="sr-only">View order details</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Pagination ─── */}
      {total > limit && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2.5 rounded-xl border border-gray-200/60 text-sm font-medium disabled:opacity-40 hover:border-primary/30 hover:bg-primary/5 transition-all"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 font-medium">
            Page <span className="text-primary">{page}</span> of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-5 py-2.5 rounded-xl border border-gray-200/60 text-sm font-medium disabled:opacity-40 hover:border-primary/30 hover:bg-primary/5 transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
