/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  RefreshCw,
  Package,
  TrendingDown,
  Search,
  Filter,
  Truck,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
} from "lucide-react";
import {
  getAllVendorStockVariants,
  getLowStockVariantsByVendor,
  getOutOfStockVariantsByVendor,
} from "@/services/inventory.service";
import { updateStock } from "@/services/product.service";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { getMyVendorProfile } from "@/services/vendor.service";
import Image from "next/image";

type Tab = "ALL" | "LOW_STOCK" | "OUT_OF_STOCK";

interface FilterOptions {
  status: string;
  sortBy: string;
  minStock: string;
  maxStock: string;
}

export default function VendorInventoryPage() {
  const [tab, setTab] = useState<Tab>("ALL");
  const [variants, setVariants] = useState<any[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockAdj, setStockAdj] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState<Record<number, boolean>>({});
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: "",
    sortBy: "stock_asc",
    minStock: "",
    maxStock: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const loadVendorProfile = async () => {
    const vRes = await getMyVendorProfile();
    if (vRes?.data?.id) {
      setVendorId(vRes.data.id);
      return vRes.data.id;
    }
    return null;
  };

  const loadVariants = async (page = 1) => {
    if (!vendorId) return;

    setLoading(true);

    // Prepare params based on active tab
    let params: any = {
      page,
      limit: pagination.limit,
      search: searchTerm || undefined,
    };

    if (tab === "ALL") {
      // Use getAllVendorStockVariants for ALL tab
      params.status = filters.status || undefined;
      params.sortBy = filters.sortBy || undefined;
      params.minStock = filters.minStock ? Number(filters.minStock) : undefined;
      params.maxStock = filters.maxStock ? Number(filters.maxStock) : undefined;

      const res = await getAllVendorStockVariants(vendorId, params);
      if (res?.success) {
        const data = res.data?.variants ?? res.data ?? [];
        setVariants(data);
        setFilteredVariants(data);
        setPagination({
          ...pagination,
          page,
          total: res.data?.total || res.total || data.length,
          totalPages:
            res.data?.totalPages ||
            Math.ceil((res.total || data.length) / pagination.limit),
        });
      }
    } else if (tab === "LOW_STOCK") {
      // Use getLowStockVariantsByVendor for LOW_STOCK tab
      const res = await getLowStockVariantsByVendor(vendorId, {
        page,
        limit: pagination.limit,
        threshold: 10,
      });
      if (res?.success) {
        const data = res.data?.variants ?? res.data ?? [];
        setVariants(data);
        setFilteredVariants(data);
        setPagination({
          ...pagination,
          page,
          total: res.total || data.length,
          totalPages:
            res.totalPages ||
            Math.ceil((res.total || data.length) / pagination.limit),
        });
      }
    } else if (tab === "OUT_OF_STOCK") {
      // Use getOutOfStockVariantsByVendor for OUT_OF_STOCK tab
      const res = await getOutOfStockVariantsByVendor(vendorId, {
        page,
        limit: pagination.limit,
      });
      if (res?.success) {
        const data = res.data?.variants ?? res.data ?? [];
        setVariants(data);
        setFilteredVariants(data);
        setPagination({
          ...pagination,
          page,
          total: res.total || data.length,
          totalPages:
            res.totalPages ||
            Math.ceil((res.total || data.length) / pagination.limit),
        });
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const id = await loadVendorProfile();
      if (id) {
        await loadVariants(1);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (vendorId) {
      setPagination((prev) => ({ ...prev, page: 1 }));
      loadVariants(1);
    }
  }, [tab, vendorId]);

  // Debounced search
  useEffect(() => {
    if (vendorId) {
      const timer = setTimeout(() => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        loadVariants(1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const handleRestock = async (variant: any) => {
    const change = Number(stockAdj[variant.id] ?? 0);
    if (!change || change <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setUpdating((prev) => ({ ...prev, [variant.id]: true }));
    const fd = new FormData();
    fd.append("data", JSON.stringify({ change, reason: "RESTOCK" }));
    const res = await updateStock(variant.product?.id, variant.id, fd);

    if (res?.success) {
      toast.success(`Successfully added ${change} units to stock`);
      setStockAdj((prev) => ({ ...prev, [variant.id]: "" }));
      loadVariants(pagination.page);
    } else {
      toast.error(res?.message ?? "Failed to update stock");
    }
    setUpdating((prev) => ({ ...prev, [variant.id]: false }));
  };

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadVariants(1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      sortBy: "stock_asc",
      minStock: "",
      maxStock: "",
    });
    setSearchTerm("");
    setTimeout(() => {
      loadVariants(1);
    }, 0);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        color: "text-red-600",
        bg: "bg-red-50",
        icon: AlertCircle,
      };
    if (stock <= 5)
      return {
        label: "Critical",
        color: "text-red-500",
        bg: "bg-red-50",
        icon: AlertTriangle,
      };
    if (stock <= 10)
      return {
        label: "Low Stock",
        color: "text-amber-500",
        bg: "bg-amber-50",
        icon: TrendingDown,
      };
    return {
      label: "In Stock",
      color: "text-green-500",
      bg: "bg-green-50",
      icon: CheckCircle,
    };
  };

  const stats = {
    total: variants.length,
    critical: variants.filter((v) => v.stock > 0 && v.stock <= 5).length,
    low: variants.filter((v) => v.stock > 5 && v.stock <= 10).length,
    outOfStock: variants.filter((v) => v.stock === 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Inventory Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage your product stock levels
          </p>
        </div>
        <button
          onClick={() => loadVariants(pagination.page)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total}
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
              <p className="text-sm text-gray-500">Critical Stock</p>
              <p className="text-2xl font-bold text-red-500 mt-1">
                {stats.critical}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">
                {stats.low}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingDown size={20} className="text-amber-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.outOfStock}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Package size={20} className="text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
          {(["ALL", "LOW_STOCK", "OUT_OF_STOCK"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
                tab === t
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <div className="flex items-center gap-2">
                {t === "ALL" && <Package size={14} />}
                {t === "LOW_STOCK" && <TrendingDown size={14} />}
                {t === "OUT_OF_STOCK" && <AlertCircle size={14} />}
                {t === "ALL"
                  ? "All Stock"
                  : t === "LOW_STOCK"
                  ? "Low Stock"
                  : "Out of Stock"}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full sm:w-64"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Button (only for ALL tab) */}
          {tab === "ALL" && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors",
                showFilters && "bg-primary/10 border-primary text-primary",
              )}
            >
              <Filter size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && tab === "ALL" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="">All</option>
                <option value="IN_STOCK">In Stock (&gt;10)</option>
                <option value="LOW_STOCK">Low Stock (1-10)</option>
                <option value="OUT_OF_STOCK">Out of Stock (0)</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="stock_asc">Stock (Low to High)</option>
                <option value="stock_desc">Stock (High to Low)</option>
                <option value="name_asc">Name (A to Z)</option>
                <option value="name_desc">Name (Z to A)</option>
                <option value="updatedAt_desc">Recently Updated</option>
                <option value="updatedAt_asc">Oldest Updated</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Min Stock
              </label>
              <input
                type="number"
                min={0}
                value={filters.minStock}
                onChange={(e) =>
                  setFilters({ ...filters, minStock: e.target.value })
                }
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Max Stock
              </label>
              <input
                type="number"
                min={0}
                value={filters.maxStock}
                onChange={(e) =>
                  setFilters({ ...filters, maxStock: e.target.value })
                }
                placeholder="100"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="skeleton w-12 h-12 rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32 bg-gray-200 rounded" />
                  <div className="skeleton h-3 w-48 bg-gray-200 rounded" />
                </div>
                <div className="skeleton h-10 w-32 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredVariants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Package size={32} className="text-gray-400" />
          </div>
          <div>
            <p className="text-gray-900 font-medium">
              {tab === "ALL"
                ? "No products found"
                : tab === "LOW_STOCK"
                ? "No low-stock items"
                : "No out-of-stock items"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {tab === "ALL"
                ? "Try adjusting your search or filters"
                : tab === "LOW_STOCK"
                ? "All your products have healthy stock levels! 🎉"
                : "All products are in stock! 🎉"}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <AnimatePresence>
              {filteredVariants.map((v, i) => {
                const status = getStockStatus(v.stock);
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-shadow p-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                        {v.product?.images?.[0]?.url ? (
                          <Image
                            src={v.product.images[0].url}
                            alt={v.product?.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {v.product?.name ?? "Unknown Product"}
                          </h3>
                          <span className="text-xs font-mono text-gray-400">
                            SKU: {v.sku}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium",
                              status.bg,
                              status.color,
                            )}
                          >
                            <StatusIcon size={12} />
                            {status.label}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-gray-500">
                              Current Stock:
                            </span>
                            <span
                              className={cn(
                                "font-bold",
                                v.stock === 0
                                  ? "text-red-600"
                                  : "text-gray-900",
                              )}
                            >
                              {v.stock} units
                            </span>
                          </div>
                          {v.updatedAt && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock size={12} />
                              Last updated: {formatDate(v.updatedAt)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Restock Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            value={stockAdj[v.id] ?? ""}
                            onChange={(e) =>
                              setStockAdj((prev) => ({
                                ...prev,
                                [v.id]: e.target.value,
                              }))
                            }
                            placeholder="Qty"
                            className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                          <Plus
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                        </div>
                        <button
                          onClick={() => handleRestock(v)}
                          disabled={updating[v.id]}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-all disabled:opacity-50"
                        >
                          {updating[v.id] ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Truck size={14} />
                          )}
                          Add Stock
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => loadVariants(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => loadVariants(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
