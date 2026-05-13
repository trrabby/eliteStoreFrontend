/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Plus } from "lucide-react";
import { RatingBreakdown } from "./RatingBreakdown";
import { ReviewCard } from "./ReviewCard";
import { Pagination } from "./Pagination";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { getProductReviews } from "@/services/review.service";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";

type ReviewSectionProps = {
  productId: number;
  averageRating: number;
  reviewCount: number;
};

export function ReviewSection({
  productId,
  averageRating,
  reviewCount,
}: ReviewSectionProps) {
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    load();
  }, [productId, page, rating, sortBy]);

  const reviews = data?.reviews ?? [];
  const total = data?.total ?? 0;
  const breakdown = data?.ratingBreakdown ?? {};

  return (
    <div className="mt-12">
      <SectionHeader
        title="Customer Reviews"
        subtitle={`${reviewCount} verified reviews`}
      />

      {/* Breakdown */}
      {reviewCount > 0 && (
        <div className="card p-6 mb-6">
          <RatingBreakdown
            averageRating={averageRating}
            reviewCount={reviewCount}
            breakdown={breakdown}
          />
        </div>
      )}

      {/* Write review CTA */}
      {isLoggedIn && (
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {/* Rating filter */}
            <div className="flex gap-1">
              {[0, 5, 4, 3, 2, 1].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRating(r === 0 ? undefined : r);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium
                              transition-all border
                              ${
                                (r === 0 && !rating) || rating === r
                                  ? "bg-primary text-white border-primary"
                                  : "border-gray-200 text-gray-600 hover:border-primary"
                              }`}
                >
                  {r === 0 ? "All" : `${r}★`}
                </button>
              ))}
            </div>
          </div>

          <Link
            href={`#write-review`}
            className="flex items-center gap-1.5 btn-secondary text-sm
                       px-4 py-2"
          >
            <Star size={14} />
            Write Review
          </Link>
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex gap-3">
                <div className="skeleton w-9 h-9 rounded-full" />
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
        <div className="text-center py-12 text-gray-400">
          <Star size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No reviews yet</p>
          <p className="text-sm mt-1">Be the first to review this product</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review: any, i: number) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 6 && (
        <div className="mt-6">
          <Pagination total={total} limit={6} page={page} />
        </div>
      )}
    </div>
  );
}
