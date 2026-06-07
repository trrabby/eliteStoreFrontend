/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Store, ShoppingCart, DollarSign } from "lucide-react";
import { getAllOrders, getOrderStats } from "@/services/order.service";
import { getAllUsers } from "@/services/user.service";
import { getAllVendors } from "@/services/vendor.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  PROCESSING: "bg-purple-50 text-purple-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  href,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  href?: string;
}) {
  const inner = (
    <motion.div
      whileHover={{ y: -2 }}
      className={`card p-5 border-l-4 ${color}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="font-display text-2xl font-bold text-gray-900">
            {value}
          </p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className="p-2 rounded-xl bg-gray-50">
          <Icon size={18} className="text-gray-500" />
        </div>
      </div>
    </motion.div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState({ total: 0 });
  const [vendors, setVendors] = useState({ total: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [statsRes, ordersRes, usersRes, vendorsRes] = await Promise.all([
        getOrderStats(),
        getAllOrders({ page: 1, limit: 8, status: "" }),
        getAllUsers({ page: 1, limit: 1 }),
        getAllVendors({ page: 1, limit: 1, isVerified: false }),
      ]);
      if (statsRes?.success) setStats(statsRes.data);
      if (ordersRes?.success)
        setOrders(ordersRes.data?.orders ?? ordersRes.data ?? []);
      //   console.log(statsRes, usersRes, vendorsRes, ordersRes);
      if (usersRes?.success)
        setUsers({ total: (usersRes.data?.count as number) ?? 0 });
      if (vendorsRes?.success)
        setVendors({
          total: vendorsRes.data?.total ?? 0,
          pending: vendorsRes.data?.total ?? 0,
        });
      setLoading(false);
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );

  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.total ?? 0;
  const pendingCount = stats?.pending ?? 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={users.total}
          color="border-blue-400"
          href="/admin/users"
        />
        <StatCard
          icon={Store}
          label="Vendors"
          value={vendors.total}
          sub={`${vendors.pending} awaiting`}
          color="border-amber-400"
          href="/admin/vendors"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={totalOrders}
          sub={`${pendingCount} pending`}
          color="border-primary"
          href="/admin/orders"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatBDT(totalRevenue)}
          color="border-green-400"
        />
      </div>

      {/* Order status breakdown */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(stats).map(([status, count]: [string, any]) => (
            <div key={status} className="card p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{status}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          <Link
            href="/admin/orders"
            className="text-xs text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                {["Order #", "Customer", "Amount", "Status", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-500 px-4 py-3"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    #{o.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {o.user?.accountInfo?.firstName}{" "}
                    {o.user?.accountInfo?.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-primary">
                    {formatBDT(o.totalAmount ?? 0)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        STATUS_COLOR[o.status] ?? "bg-gray-50 text-gray-600",
                      )}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {formatDate(o.createdAt)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
