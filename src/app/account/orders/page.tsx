/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Package, ChevronRight, Search, Filter } from "lucide-react";
import { getMyOrders } from "@/services/order.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50   text-blue-700   border-blue-200",
  PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-50  text-green-700  border-green-200",
  CANCELLED: "bg-red-50    text-red-700    border-red-200",
  RETURNED: "bg-gray-50   text-gray-700   border-gray-200",
};

const STATUS_TABS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const load = async () => {
    setLoading(true);
    const res = await getMyOrders({
      page,
      limit,
      status: activeTab === "ALL" ? undefined : activeTab,
    });
    if (res?.success) {
      setOrders(res.data?.orders ?? res.data ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [activeTab, page]);

  const filtered = search
    ? orders.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
          o.items?.some((i: any) =>
            i.product?.name?.toLowerCase().includes(search.toLowerCase()),
          ),
      )
    : orders;

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-bold text-gray-900">
        My Orders
      </h2>

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order number or product..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={cn(
              "shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-primary text-white shadow-pink"
                : "bg-white border border-gray-200 text-gray-600 hover:border-primary",
            )}
          >
            {tab === "ALL"
              ? "All Orders"
              : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center gap-3">
          <Package size={48} className="text-gray-200" />
          <p className="text-gray-500">No orders found.</p>
          <Link href="/products" className="btn-primary px-6 py-2.5 text-sm">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5 hover:shadow-pink transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full border font-medium",
                        STATUS_COLORS[order.status] ??
                          "bg-gray-50 text-gray-600 border-gray-200",
                      )}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Items preview */}
                  <div className="flex items-center gap-2 mb-2">
                    {order.items
                      ?.slice(0, 3)
                      .map(
                        (item: any, idx: number) =>
                          item.product?.images?.[0]?.url && (
                            <Image
                              key={idx}
                              src={item.product.images[0].url}
                              height={30}
                              width={30}
                              alt={item.product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                            />
                          ),
                      )}
                    {(order.items?.length ?? 0) > 3 && (
                      <span className="text-xs text-gray-400 ml-1">
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{order.items?.length ?? 0} item(s)</span>
                    <span>
                      {order.createdAt ? formatDate(order.createdAt) : ""}
                    </span>
                    <span className="font-semibold text-primary text-sm">
                      {formatBDT(order.totalAmount ?? 0)}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center gap-1 text-sm text-primary font-medium
                             hover:gap-2 transition-all flex-shrink-0"
                >
                  Details <ChevronRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40 hover:border-primary"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / limit)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40 hover:border-primary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
