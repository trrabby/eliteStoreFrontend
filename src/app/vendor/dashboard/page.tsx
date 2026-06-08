/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  Star,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";
import { getMyProducts } from "@/services/product.service";
import { getMyOrders } from "@/services/order.service";
import { getMyVendorProfile } from "@/services/vendor.service";
import { getLowStockVariantsByVendor } from "@/services/inventory.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

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
  const content = (
    <motion.div
      whileHover={{ y: -2 }}
      className={`card p-5 border-l-4 ${color} cursor-default text-nowrap`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="font-display text-2xl font-bold text-gray-900">
            {value}
          </p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className="p-2.5 rounded-xl bg-gray-50">
          <Icon size={20} className="text-gray-500" />
        </div>
      </div>
    </motion.div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default function VendorDashboardPage() {
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const vRes = await getMyVendorProfile();
      const [pRes, oRes, lRes] = await Promise.all([
        getMyProducts({ limit: 5, status: "ACTIVE" }),
        getMyOrders({ limit: 5 }),
        getLowStockVariantsByVendor(vRes?.data?.id, {
          limit: 5,
          threshold: 10,
        }),
      ]);
      // console.log(vRes, pRes, oRes, lRes);
      if (vRes?.success) setVendor(vRes.data);
      if (pRes?.success) setProducts(pRes.data?.products ?? []);
      if (oRes?.success) setOrders(oRes.data?.orders ?? oRes.data ?? []);
      if (lRes?.success) setLowStock(lRes.data?.variants ?? lRes.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((s, o) => s + Number(o.totalAmount ?? 0), 0);

  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  if (loading)
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Store info banner */}
      {vendor && (
        <div className="card p-5 flex items-center gap-4">
          {vendor.logo ? (
            <Image
              src={vendor.logo}
              alt={vendor.storeName}
              className="w-14 h-14 rounded-2xl object-cover"
              width={56}
              height={56}
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-xl font-bold">
              {vendor.storeName?.[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-display text-2xl font-bold text-gray-900">
                {vendor.storeName}
              </h2>
              {vendor.isVerified ? (
                <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                  <BadgeCheck size={12} />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full font-medium">
                  <Clock size={12} />
                  Pending Verification
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm text-gray-500">
                Vendor ID: #{vendor.id}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="text-sm text-gray-500">
                Member since{" "}
                {new Date(vendor.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {vendor.description ?? "No description set"}
            </p>
          </div>
          <Link
            href="/vendor/store"
            className="btn-secondary px-4 py-2 text-sm flex items-center gap-1.5 shrink-0"
          >
            Edit Store <ArrowUpRight size={13} />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Active Products"
          value={vendor?._count?.products ?? products.length}
          sub={`${
            products?.filter((p) => p.status === "DRAFT").length ?? 0
          } drafts`}
          color="border-primary"
          href="/vendor/products"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={orders.length}
          sub={`${pendingOrders} pending`}
          color="border-blue-400"
          href="/vendor/orders"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={formatBDT(totalRevenue)}
          sub="Delivered orders"
          color="border-green-400"
        />
        <StatCard
          icon={Star}
          label="Store Rating"
          value={vendor?.rating ? Number(vendor.rating).toFixed(1) : "—"}
          sub={`${vendor?.totalSales ?? 0} sales`}
          color="border-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <Link
              href="/vendor/orders"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No orders yet
            </p>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.createdAt ? formatDate(order.createdAt) : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        order.status === "DELIVERED"
                          ? "bg-green-50 text-green-600"
                          : order.status === "PENDING"
                          ? "bg-yellow-50 text-yellow-600"
                          : "bg-gray-50 text-gray-600",
                      )}
                    >
                      {order.status}
                    </span>
                    <p className="text-sm font-bold text-primary mt-0.5">
                      {formatBDT(order.totalAmount ?? 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock alert */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-500" />
              Low Stock Alert
            </h3>
            <Link
              href="/vendor/inventory"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              All products well-stocked ✓
            </p>
          ) : (
            <div className="space-y-2">
              {lowStock.slice(0, 5).map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                      {variant.product?.name ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400">SKU: {variant.sku}</p>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full font-bold",
                      variant.stock === 0
                        ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-600",
                    )}
                  >
                    {variant.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent products */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">My Products</h3>
          <Link
            href="/vendor/products"
            className="text-xs text-primary hover:underline"
          >
            Manage
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/vendor/products/${p.id}/edit`}
              className="group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-primary-pale mb-2">
                {p.images?.[0]?.url ? (
                  <img
                    src={p.images[0].url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-pale" />
                )}
                <span
                  className={cn(
                    "absolute top-1.5 right-1.5 text-xs px-1.5 py-0.5 rounded-full font-medium",
                    p.status === "ACTIVE"
                      ? "bg-green-500 text-white"
                      : "bg-gray-400 text-white",
                  )}
                >
                  {p.status === "ACTIVE" ? "Live" : p.status}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-800 truncate group-hover:text-primary transition-colors">
                {p.name}
              </p>
              <p className="text-xs text-primary font-bold">
                {formatBDT(p.variants?.[0]?.price ?? 0)}
              </p>
            </Link>
          ))}
          <Link
            href="/vendor/products/create"
            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-primary hover:text-primary text-gray-400 transition-all group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              +
            </span>
            <span className="text-xs font-medium">Add Product</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
