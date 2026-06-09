/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Search,
  Filter,
  X,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Package,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  getAllReviewsByVendor,
  getReviewById,
} from "@/services/review.service";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { getMyVendorProfile } from "@/services/vendor.service";

interface FilterOptions {
  status: string;
  rating: number | undefined;
  search: string;
  sortBy: string;
  dateFrom: string;
  dateTo: string;
  hasResponse: boolean | undefined;
  withImages: boolean | undefined;
}

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const limit = 12;

  const [filters, setFilters] = useState<FilterOptions>({
    status: "",
    rating: undefined,
    search: "",
    sortBy: "createdAt_desc",
    dateFrom: "",
    dateTo: "",
    hasResponse: undefined,
    withImages: undefined,
  });

  const loadVendorProfile = async () => {
    const vRes = await getMyVendorProfile();
    if (vRes?.data?.id) {
      setVendorId(vRes.data.id);
      return vRes.data.id;
    }
    return null;
  };

  const loadReviews = async (pageNum = 1) => {
    if (!vendorId) return;

    setLoading(true);
    const res = await getAllReviewsByVendor(vendorId, {
      page: pageNum,
      limit,
      status: filters.status || undefined,
      rating: filters.rating,
      search: filters.search || undefined,
      sortBy: filters.sortBy || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      hasResponse: filters.hasResponse,
      withImages: filters.withImages,
    });

    if (res?.success && res.data) {
      setReviews(res.data.data?.reviews ?? []);
      setTotal(res.data.data?.pagination?.total ?? 0);
      setTotalPages(res.data.data?.pagination?.totalPages ?? 0);
      setSummary(res.data.data?.summary);
      // Sort distribution by rating descending (5 first)
      const dist = res.data.data?.distribution ?? [];
      setDistribution(dist.sort((a: any, b: any) => b.rating - a.rating));
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const id = await loadVendorProfile();
      if (id) {
        await loadReviews(1);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (vendorId) {
      setPage(1);
      loadReviews(1);
    }
  }, [filters, vendorId]);

  // Debounced search
  useEffect(() => {
    if (vendorId) {
      const timer = setTimeout(() => {
        setPage(1);
        loadReviews(1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filters.search]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      rating: undefined,
      search: "",
      sortBy: "createdAt_desc",
      dateFrom: "",
      dateTo: "",
      hasResponse: undefined,
      withImages: undefined,
    });
    setShowFilters(false);
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.rating) count++;
    if (filters.search) count++;
    if (filters.sortBy !== "createdAt_desc") count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.hasResponse !== undefined) count++;
    if (filters.withImages !== undefined) count++;
    return count;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          label: "Approved",
          color: "text-green-600",
          bg: "bg-green-50",
          icon: CheckCircle,
        };
      case "PENDING":
        return {
          label: "Pending",
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          icon: Clock,
        };
      case "REJECTED":
        return {
          label: "Rejected",
          color: "text-red-600",
          bg: "bg-red-50",
          icon: AlertCircle,
        };
      default:
        return {
          label: status,
          color: "text-gray-600",
          bg: "bg-gray-50",
          icon: MessageSquare,
        };
    }
  };

  const openReviewModal = async (reviewId: number) => {
    setLoadingModal(true);
    setModalOpen(true);
    const res = await getReviewById(reviewId);
    if (res?.success) {
      setSelectedReview(res.data);
    } else {
      setSelectedReview(null);
    }
    setLoadingModal(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedReview(null);
  };

  const getRatingTrend = () => {
    if (!summary || summary.totalReviews === 0) return null;
    if (summary.averageRating >= 4.5)
      return { icon: TrendingUp, text: "Excellent", color: "text-green-600" };
    if (summary.averageRating >= 3.5)
      return { icon: TrendingUp, text: "Good", color: "text-blue-600" };
    if (summary.averageRating >= 2.5)
      return { icon: Minus, text: "Average", color: "text-yellow-600" };
    return {
      icon: TrendingDown,
      text: "Needs Improvement",
      color: "text-red-600",
    };
  };

  const trend = getRatingTrend();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Product Reviews
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and respond to customer reviews
          </p>
        </div>

        {/* Summary Stats Card */}
        {summary && summary.totalReviews > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl px-5 py-2.5 shadow-sm border border-amber-100"
          >
            <div className="flex items-center gap-2">
              <Star size={24} className="fill-amber-400 text-amber-400" />
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {summary.averageRating}
                  </span>
                  <span className="text-sm text-gray-500">/5</span>
                </div>
                <p className="text-xs text-gray-500">
                  {summary.totalReviews} reviews
                </p>
              </div>
            </div>
            {trend && (
              <div className="flex items-center gap-1.5 pl-3 border-l border-amber-200">
                <trend.icon size={16} className={trend.color} />
                <span className={`text-sm font-medium ${trend.color}`}>
                  {trend.text}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Rating Distribution - Classy Design with 5 Stars First */}
      {distribution.length > 0 && summary?.totalReviews > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-900">
              Rating Distribution
            </h3>
          </div>

          <div className="space-y-3.5">
            {distribution.map((item, idx) => {
              const percentage = summary.totalReviews
                ? ((item.count / summary.totalReviews) * 100).toFixed(0)
                : 0;
              const isActive = filters.rating === item.rating;

              return (
                <motion.div
                  key={item.rating}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group cursor-pointer"
                  onClick={() => {
                    handleFilterChange(
                      "rating",
                      filters.rating === item.rating ? undefined : item.rating,
                    );
                    setPage(1);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 w-14">
                      <span className="text-sm font-semibold text-gray-700">
                        {item.rating}
                      </span>
                      <Star
                        size={14}
                        className="fill-amber-400 text-amber-400"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="relative">
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.05 }}
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              isActive
                                ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                : "bg-gradient-to-r from-amber-400 to-amber-300",
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="w-20 text-right">
                      <span className="text-sm font-medium text-gray-700">
                        {item.count}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">
                        ({percentage}%)
                      </span>
                    </div>

                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center"
                      >
                        <CheckCircle size={12} className="text-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
            <span className="text-gray-400">
              Total reviews: {summary.totalReviews}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <span className="text-gray-400">
                Average rating: {summary.averageRating} / 5
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by product, customer, or review content..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange("search", "")}
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
            "relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200",
            showFilters
              ? "bg-primary text-white border-primary shadow-sm"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
          )}
        >
          <Filter size={16} />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount() > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center shadow-sm"
            >
              {activeFilterCount()}
            </motion.span>
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
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
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
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Review Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all"
                    >
                      <option value="">All Status</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PENDING">Pending</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Minimum Rating
                    </label>
                    <select
                      value={filters.rating || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "rating",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all"
                    >
                      <option value="">All Ratings</option>
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars & Up</option>
                      <option value={3}>3 Stars & Up</option>
                      <option value={2}>2 Stars & Up</option>
                      <option value={1}>1 Star & Up</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all"
                    >
                      <option value="createdAt_desc">Newest First</option>
                      <option value="createdAt_asc">Oldest First</option>
                      <option value="rating_desc">Highest Rating</option>
                      <option value="rating_asc">Lowest Rating</option>
                    </select>
                  </div>

                  {/* Additional Filters */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Additional Filters
                    </label>
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.hasResponse === true}
                          onChange={(e) =>
                            handleFilterChange(
                              "hasResponse",
                              e.target.checked ? true : undefined,
                            )
                          }
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                          Has Response
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.withImages === true}
                          onChange={(e) =>
                            handleFilterChange(
                              "withImages",
                              e.target.checked ? true : undefined,
                            )
                          }
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                          With Images
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Date From
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        handleFilterChange("dateFrom", e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Date To
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) =>
                        handleFilterChange("dateTo", e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Active Filters Display */}
                {activeFilterCount() > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">
                        Active filters:
                      </span>
                      {filters.status && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg">
                          Status: {filters.status}
                          <button
                            onClick={() => handleFilterChange("status", "")}
                          >
                            <X size={10} />
                          </button>
                        </span>
                      )}
                      {filters.rating && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg">
                          Rating: {filters.rating}★+
                          <button
                            onClick={() =>
                              handleFilterChange("rating", undefined)
                            }
                          >
                            <X size={10} />
                          </button>
                        </span>
                      )}
                      {(filters.dateFrom || filters.dateTo) && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg">
                          Date: {filters.dateFrom || "any"} -{" "}
                          {filters.dateTo || "any"}
                          <button
                            onClick={() => {
                              handleFilterChange("dateFrom", "");
                              handleFilterChange("dateTo", "");
                            }}
                          >
                            <X size={10} />
                          </button>
                        </span>
                      )}
                      {filters.hasResponse !== undefined && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg">
                          Has Response
                          <button
                            onClick={() =>
                              handleFilterChange("hasResponse", undefined)
                            }
                          >
                            <X size={10} />
                          </button>
                        </span>
                      )}
                      {filters.withImages !== undefined && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg">
                          With Images
                          <button
                            onClick={() =>
                              handleFilterChange("withImages", undefined)
                            }
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
                    onClick={() => setShowFilters(false)}
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
      <AnimatePresence>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="skeleton w-12 h-12 rounded-lg bg-gray-200" />
                  <div className="flex-1">
                    <div className="skeleton h-4 w-32 bg-gray-200 rounded mb-2" />
                    <div className="skeleton h-3 w-48 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center text-center gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <Star size={40} className="text-gray-300" />
            </div>
            <div>
              <p className="text-gray-900 font-medium text-lg">
                No reviews found
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {activeFilterCount() > 0
                  ? "Try adjusting your filters to see more results"
                  : "No customer reviews yet for your products"}
              </p>
            </div>
            {activeFilterCount() > 0 && (
              <button
                onClick={clearFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="space-y-2">
              <AnimatePresence>
                {reviews.map((review, i) => {
                  const statusBadge = getStatusBadge(review.status);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.02, duration: 0.2 }}
                      className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                      onClick={() => openReviewModal(review.id)}
                    >
                      <div className="flex items-center gap-3 p-3">
                        {/* Product Image */}
                        <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-200">
                          {review.product?.images?.[0]?.url ? (
                            <Image
                              src={review.product.images[0].url}
                              alt={review.product.name}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Review Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium text-gray-700 truncate">
                              {review.user?.accountInfo?.firstName ||
                                "Customer"}
                            </span>
                            {review.isVerified && (
                              <CheckCircle
                                size={10}
                                className="text-green-500 shrink-0"
                              />
                            )}
                            <div className="flex items-center gap-0.5 ml-auto">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <Star
                                  key={j}
                                  size={10}
                                  className={cn(
                                    j < review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-200 fill-gray-200",
                                  )}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-sm text-gray-800 line-clamp-1">
                            {review.title ||
                              review.body?.substring(0, 60) ||
                              "No comment"}
                          </p>

                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400">
                              {formatDate(review.createdAt)}
                            </span>
                            <div
                              className={cn(
                                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                                statusBadge.bg,
                                statusBadge.color,
                              )}
                            >
                              <StatusIcon size={8} />
                              {statusBadge.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between pt-4"
              >
                <button
                  onClick={() => {
                    setPage(page - 1);
                    loadReviews(page - 1);
                  }}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1.5">
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
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setPage(pageNum);
                          loadReviews(pageNum);
                        }}
                        className={cn(
                          "w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200",
                          page === pageNum
                            ? "bg-primary text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100",
                        )}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    setPage(page + 1);
                    loadReviews(page + 1);
                  }}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Modal for Review Details */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {loadingModal ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : selectedReview ? (
                <>
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-gray-900">
                      Review Details
                    </h3>
                    <button
                      onClick={closeModal}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Product Info */}
                    <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                      <div className="flex-1">
                        <Link
                          href={`/products/${selectedReview.product.slug}`}
                          target="_blank"
                          className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors inline-flex items-center gap-1"
                        >
                          {selectedReview.product.name}
                          <ExternalLink size={14} />
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          Product ID: #{selectedReview.product.id}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          getStatusBadge(selectedReview.status).bg,
                          getStatusBadge(selectedReview.status).color,
                        )}
                      >
                        {(() => {
                          const badge = getStatusBadge(selectedReview.status);
                          return badge.icon && <badge.icon size={12} />;
                        })()}
                        {getStatusBadge(selectedReview.status).label}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold shadow-sm">
                        {selectedReview.user?.accountInfo?.firstName?.[0] ||
                          selectedReview.user?.email?.[0] ||
                          "U"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedReview.user?.accountInfo?.firstName}{" "}
                          {selectedReview.user?.accountInfo?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedReview.user?.email}
                        </p>
                        {selectedReview.isVerified && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle size={12} className="text-green-500" />
                            <span className="text-xs text-green-600">
                              Verified Purchase
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            className={cn(
                              i < selectedReview.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200 fill-gray-200",
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        {selectedReview.rating} out of 5
                      </span>
                    </div>

                    {/* Title & Body */}
                    {selectedReview.title && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          Title
                        </h4>
                        <p className="text-gray-700">{selectedReview.title}</p>
                      </div>
                    )}
                    {selectedReview.body && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          Review
                        </h4>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {selectedReview.body}
                        </p>
                      </div>
                    )}

                    {/* Images */}
                    {selectedReview.images &&
                      selectedReview.images.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Images
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {selectedReview.images.map(
                              (img: string, idx: number) => (
                                <motion.div
                                  key={idx}
                                  whileHover={{ scale: 1.05 }}
                                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                                >
                                  <Image
                                    src={img}
                                    alt={`Review image ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 200px"
                                  />
                                </motion.div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Metadata */}
                    <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Review ID:</span>
                        <p className="text-gray-900 font-mono text-xs mt-1">
                          {selectedReview.publicId}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Order Item ID:</span>
                        <p className="text-gray-900">
                          {selectedReview.orderItemId || "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created At:</span>
                        <p className="text-gray-900">
                          {formatDate(selectedReview.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Updated:</span>
                        <p className="text-gray-900">
                          {formatDate(selectedReview.updatedAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Helpful Count:</span>
                        <p className="text-gray-900">
                          {selectedReview.helpfulCount}
                        </p>
                      </div>
                    </div>

                    {/* Vendor Response Section */}
                    {selectedReview.vendorResponse && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare size={14} className="text-green-600" />
                          <h4 className="text-sm font-semibold text-gray-900">
                            Your Response
                          </h4>
                        </div>
                        <p className="text-sm text-gray-700">
                          {selectedReview.vendorResponse.response}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Responded on{" "}
                          {formatDate(selectedReview.vendorResponse.createdAt)}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Failed to load review details
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
