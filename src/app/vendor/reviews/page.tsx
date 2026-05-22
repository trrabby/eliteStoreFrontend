/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getAllReviews } from "@/services/review.service";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getAllReviews({ page, limit, rating: filter });
      if (res?.success) {
        setReviews(res.data?.reviews ?? res.data ?? []);
        setTotal(res.data?.total ?? 0);
      }
      setLoading(false);
    };
    load();
  }, [filter, page]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Product Reviews
        </h2>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              className={cn(
                i < Number(avgRating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-200 fill-gray-200",
              )}
            />
          ))}
          <span className="text-sm font-bold text-gray-900 ml-1">
            {avgRating}
          </span>
        </div>
      </div>

      {/* Rating filter */}
      <div className="flex gap-2">
        {[undefined, 5, 4, 3, 2, 1].map((r) => (
          <button
            key={r ?? "all"}
            onClick={() => {
              setFilter(r);
              setPage(1);
            }}
            className={cn(
              "px-3 py-1.5 rounded-xl text-sm font-medium transition-all",
              filter === r
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-primary",
            )}
          >
            {r === undefined ? "All" : `${r}★`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center gap-3">
          <Star size={48} className="text-gray-200" />
          <p className="text-gray-500">No reviews yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card p-5"
            >
              {/* Product */}
              {review.product && (
                <Link
                  href={`/products/${review.product.slug}`}
                  className="flex items-center gap-2.5 mb-3 pb-3 border-b border-gray-100 group"
                >
                  {review.product.images?.[0]?.url && (
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-primary-pale shrink-0">
                      <Image
                        src={review.product.images[0].url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                    {review.product.name}
                  </p>
                </Link>
              )}

              {/* Reviewer */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
                    {review.user?.accountInfo?.firstName?.[0] ?? "?"}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {review.user?.accountInfo?.firstName}{" "}
                    {review.user?.accountInfo?.lastName?.[0]}.
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      size={12}
                      className={cn(
                        j < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200 fill-gray-200",
                      )}
                    />
                  ))}
                </div>
              </div>

              {review.title && (
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {review.title}
                </p>
              )}
              {review.body && (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {review.body}
                </p>
              )}

              <div className="flex items-center justify-between mt-3">
                {review.isVerified && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {total > limit && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:border-primary"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            {page} / {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / limit)}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:border-primary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
