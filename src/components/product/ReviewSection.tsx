/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Star, Pencil, Filter, ChevronDown } from "lucide-react";
import { RatingBreakdown } from "./RatingBreakdown";
import { ReviewCard } from "./ReviewCard";
import { Pagination } from "./Pagination";
import { getProductReviews } from "@/services/review.service";
import { getMyOrders } from "@/services/order.service";
import Link from "next/link";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils/cn";
import { AnimatePresence } from "framer-motion";
import { WriteReviewModal } from "../modals/WriteReviewModal";

type ReviewSectionProps = {
  productId: number;
  productSlug: string;
  averageRating: number;
  reviewCount: number;
};

export function ReviewSection({
  productId,
  productSlug,
  averageRating,
  reviewCount,
}: ReviewSectionProps) {
  const user = useAppSelector(selectCurrentUser);
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // New state for order check
  const [hasOrderedAndDelivered, setHasOrderedAndDelivered] = useState(false);
  const [checkingOrder, setCheckingOrder] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [orderItem, setOrderItem] = useState<number | undefined>(undefined);

  const load = async () => {
    setLoading(true);
    const res = await getProductReviews(productId, {
      page,
      limit: 6,
      rating,
      sortBy,
    });
    setData(res?.data ?? null);
    setLoading(false);
  };

  useEffect(() => {
    // Load reviews

    load();
  }, [productId, page, rating, sortBy]);

  // Check if user has a delivered order for this product
  useEffect(() => {
    if (!user) {
      setCheckingOrder(false);
      return;
    }

    const checkOrder = async () => {
      setCheckingOrder(true);
      let found = false;
      let currentPage = 1;
      const limit = 50;

      try {
        while (!found) {
          const res = await getMyOrders({
            page: currentPage,
            limit,
            status: "DELIVERED",
          });
          // console.log(res);
          if (!res?.success || !res.data?.orders) break;

          const orders = res.data.orders;
          // Check each order's items for the product
          for (const order of orders) {
            if (
              order.items?.some((item: any) => item.snapshot.id === productId)
            ) {
              console.log(order);
              const orderItems = order.items?.map((item: any) => item.id);
              const orderItem = orderItems[orderItems.length - 1];
              setOrderItem(orderItem);
              found = true;
              break;
            }
          }

          // If we've fetched all pages or found the product, stop
          const totalPages = Math.ceil(res.data.total / limit);
          if (currentPage >= totalPages || found) break;
          currentPage++;
        }
      } catch (error) {
        console.error("Failed to check orders:", error);
      }

      setHasOrderedAndDelivered(found);
      setCheckingOrder(false);
    };

    checkOrder();
  }, [user, productId]);

  const reviews = data?.reviews ?? [];
  const total = data?.total ?? 0;
  const breakdown = data?.ratingBreakdown ?? {};

  // Sort options
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "highest", label: "Highest Rating" },
    { value: "lowest", label: "Lowest Rating" },
    { value: "most_helpful", label: "Most Helpful" },
  ];

  // Determine if we should show the write review button
  const showWriteReview = user && hasOrderedAndDelivered;

  return (
    <div className="space-y-6">
      {/* Header with Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-gray-900">
            Customer Reviews
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-gray-400 text-sm">/ 5</span>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={cn(
                    i < Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200 fill-gray-200",
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>

        {showWriteReview && (
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowWriteModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all shadow-sm hover:shadow-md"
          >
            <Pencil size={16} />
            Write a Review
          </Link>
        )}

        {!user && (
          // When the user clicks "Write a Review", open the modal
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowWriteModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all shadow-sm hover:shadow-md"
          >
            <Pencil size={16} />
            Write a Review
          </Link>
        )}
      </div>
      {/* Rating Breakdown Card */}
      {reviewCount > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm">
          <RatingBreakdown
            averageRating={averageRating}
            reviewCount={reviewCount}
            breakdown={breakdown}
          />
        </div>
      )}
      {/* Filters & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mr-1">
            Filter by:
          </span>
          {[0, 5, 4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRating(r === 0 ? undefined : r);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                (r === 0 && !rating) || rating === r
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              {r === 0 ? "All" : `${r}★`}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 transition-all"
          >
            <Filter size={14} />
            Sort:{" "}
            {sortOptions.find((o) => o.value === sortBy)?.label || "Newest"}
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform duration-200",
                showSortDropdown && "rotate-180",
              )}
            />
          </button>

          {showSortDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setPage(1);
                    setShowSortDropdown(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm transition-colors",
                    sortBy === option.value
                      ? "bg-primary/5 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Review List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse"
            >
              <div className="flex gap-3">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-24 rounded-full" />
                  <div className="skeleton h-3 w-16 rounded-full" />
                </div>
              </div>
              <div className="skeleton h-3 w-full rounded-full" />
              <div className="skeleton h-3 w-3/4 rounded-full" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100/80 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Star size={28} className="text-gray-300" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                No reviews yet
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                {showWriteReview
                  ? "Be the first to share your experience with this product."
                  : user
                  ? "You need to purchase this product to write a review."
                  : "Login to share your experience."}
              </p>
            </div>
            {showWriteReview && (
              // When the user clicks "Write a Review", open the modal
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowWriteModal(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all shadow-sm hover:shadow-md"
              >
                <Pencil size={16} />
                Write a Review
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review: any, i: number) => (
            <ReviewCard
              key={review.id}
              review={review}
              productId={productId}
              orderItemId={orderItem}
              index={i}
              currentUser={user}
              onEdit={load}
            />
          ))}
        </div>
      )}
      {/* Pagination */}
      {total > 6 && (
        <div className="mt-4">
          <Pagination total={total} limit={6} page={page} />
        </div>
      )}

      <AnimatePresence>
        {showWriteModal && (
          <WriteReviewModal
            productId={productId}
            orderItemId={orderItem}
            onClose={() => setShowWriteModal(false)}
            onSuccess={() => {
              setPage(1);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
