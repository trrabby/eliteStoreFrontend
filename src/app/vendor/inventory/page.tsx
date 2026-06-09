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
  SlidersHorizontal,
  RotateCcw,
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
  threshold?: number;
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
    threshold: 10,
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
      params.threshold = filters.threshold || 10;

      const res = await getLowStockVariantsByVendor(vendorId, {
        page,
        limit: pagination.limit,
        threshold: params.threshold,
      });
      if (res?.success) {
        let data = res.data?.variants ?? res.data ?? [];

        // Apply client-side filters for LOW_STOCK tab
        if (filters.minStock) {
          data = data.filter((v: any) => v.stock >= Number(filters.minStock));
        }
        if (filters.maxStock) {
          data = data.filter((v: any) => v.stock <= Number(filters.maxStock));
        }

        // Apply client-side sorting
        if (filters.sortBy) {
          data = sortVariants(data, filters.sortBy);
        }

        setVariants(data);
        setFilteredVariants(data);
        setPagination({
          ...pagination,
          page,
          total: data.length,
          totalPages: Math.ceil(data.length / pagination.limit),
        });
      }
    } else if (tab === "OUT_OF_STOCK") {
      const res = await getOutOfStockVariantsByVendor(vendorId, {
        page,
        limit: pagination.limit,
      });
      if (res?.success) {
        let data = res.data?.variants ?? res.data ?? [];

        // Apply client-side sorting for OUT_OF_STOCK tab
        if (filters.sortBy) {
          data = sortVariants(data, filters.sortBy);
        }

        setVariants(data);
        setFilteredVariants(data);
        setPagination({
          ...pagination,
          page,
          total: data.length,
          totalPages: Math.ceil(data.length / pagination.limit),
        });
      }
    }

    setLoading(false);
  };

  const sortVariants = (data: any[], sortBy: string) => {
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case "stock_asc":
          return a.stock - b.stock;
        case "stock_desc":
          return b.stock - a.stock;
        case "name_asc":
          return (a.product?.name || "").localeCompare(b.product?.name || "");
        case "name_desc":
          return (b.product?.name || "").localeCompare(a.product?.name || "");
        case "updatedAt_desc":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "updatedAt_asc":
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        default:
          return a.stock - b.stock;
      }
    });
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
      threshold: 10,
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
        border: "border-red-200",
        icon: AlertCircle,
      };
    if (stock <= 5)
      return {
        label: "Critical",
        color: "text-red-500",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: AlertTriangle,
      };
    if (stock <= 10)
      return {
        label: "Low Stock",
        color: "text-amber-500",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: TrendingDown,
      };
    return {
      label: "In Stock",
      color: "text-green-500",
      bg: "bg-green-50",
      border: "border-green-200",
      icon: CheckCircle,
    };
  };

  const stats = {
    total: variants.length,
    critical: variants.filter((v) => v.stock > 0 && v.stock <= 5).length,
    low: variants.filter((v) => v.stock > 5 && v.stock <= 10).length,
    outOfStock: variants.filter((v) => v.stock === 0).length,
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.sortBy !== "stock_asc") count++;
    if (filters.minStock) count++;
    if (filters.maxStock) count++;
    if (filters.threshold !== 10) count++;
    return count;
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
        <div className="bg-linear-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package size={22} className="text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-red-50 to-white rounded-2xl border border-red-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Critical Stock</p>
              <p className="text-3xl font-bold text-red-500 mt-1">
                {stats.critical}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-amber-50 to-white rounded-2xl border border-amber-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Low Stock</p>
              <p className="text-3xl font-bold text-amber-500 mt-1">
                {stats.low}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <TrendingDown size={22} className="text-amber-500" />
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Out of Stock</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.outOfStock}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <Package size={22} className="text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
          {(["ALL", "LOW_STOCK", "OUT_OF_STOCK"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
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

        <div className="flex items-center gap-3">
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

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "relative inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200",
              showFilters
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
            )}
          >
            <SlidersHorizontal size={16} />
            <span className="text-sm font-medium">Filters</span>
            {activeFilterCount() > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Elegant Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-linear-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-primary" />
                    <h3 className="font-semibold text-gray-900">
                      Filter Options
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Status Filter - Only for ALL tab */}
                  {tab === "ALL" && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Stock Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) =>
                          setFilters({ ...filters, status: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                      >
                        <option value="">All Status</option>
                        <option value="IN_STOCK">
                          In Stock (&gt;10 units)
                        </option>
                        <option value="LOW_STOCK">
                          Low Stock (1-10 units)
                        </option>
                        <option value="OUT_OF_STOCK">
                          Out of Stock (0 units)
                        </option>
                      </select>
                    </div>
                  )}

                  {/* Threshold Filter - Only for LOW_STOCK tab */}
                  {tab === "LOW_STOCK" && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Low Stock Threshold
                      </label>
                      <select
                        value={filters.threshold}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            threshold: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                      >
                        <option value={5}>≤ 5 units (Critical)</option>
                        <option value={10}>≤ 10 units (Standard)</option>
                        <option value={15}>≤ 15 units (Generous)</option>
                        <option value={20}>≤ 20 units (Very Generous)</option>
                      </select>
                    </div>
                  )}

                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        setFilters({ ...filters, sortBy: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                    >
                      <option value="stock_asc">Stock (Low to High)</option>
                      <option value="stock_desc">Stock (High to Low)</option>
                      <option value="name_asc">Product Name (A to Z)</option>
                      <option value="name_desc">Product Name (Z to A)</option>
                      <option value="updatedAt_desc">Recently Updated</option>
                      <option value="updatedAt_asc">Oldest Updated</option>
                    </select>
                  </div>

                  {/* Stock Range */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Stock Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        value={filters.minStock}
                        onChange={(e) =>
                          setFilters({ ...filters, minStock: e.target.value })
                        }
                        placeholder="Min"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                      <span className="text-gray-400 self-center">-</span>
                      <input
                        type="number"
                        min={0}
                        value={filters.maxStock}
                        onChange={(e) =>
                          setFilters({ ...filters, maxStock: e.target.value })
                        }
                        placeholder="Max"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Active Filters Display */}
                {activeFilterCount() > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">
                        Active filters:
                      </span>
                      {filters.status && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg">
                          Status: {filters.status.replace("_", " ")}
                          <button
                            onClick={() =>
                              setFilters({ ...filters, status: "" })
                            }
                            className="hover:text-primary-dark"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      )}
                      {filters.sortBy !== "stock_asc" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg">
                          Sort: {filters.sortBy.replace("_", " ")}
                          <button
                            onClick={() =>
                              setFilters({ ...filters, sortBy: "stock_asc" })
                            }
                            className="hover:text-primary-dark"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      )}
                      {(filters.minStock || filters.maxStock) && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg">
                          Stock: {filters.minStock || "0"} -{" "}
                          {filters.maxStock || "∞"}
                          <button
                            onClick={() =>
                              setFilters({
                                ...filters,
                                minStock: "",
                                maxStock: "",
                              })
                            }
                            className="hover:text-primary-dark"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      )}
                      {filters.threshold !== 10 && tab === "LOW_STOCK" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg">
                          Threshold: ≤{filters.threshold}
                          <button
                            onClick={() =>
                              setFilters({ ...filters, threshold: 10 })
                            }
                            className="hover:text-primary-dark"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <RotateCcw size={14} />
                    Reset All
                  </button>
                  <button
                    onClick={applyFilters}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all shadow-sm hover:shadow-md"
                  >
                    <CheckCircle size={14} />
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 p-4"
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
                              "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border",
                              status.bg,
                              status.color,
                              status.border,
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
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
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
              <div className="flex items-center gap-2">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum = pagination.page;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => loadVariants(pageNum)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                          pagination.page === pageNum
                            ? "bg-primary text-white"
                            : "text-gray-600 hover:bg-gray-100",
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
              </div>
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
