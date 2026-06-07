/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Trash2 } from "lucide-react";
import { getAllReviews, deleteReview } from "@/services/review.service";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const limit = 15;

  const load = async () => {
    setLoading(true);
    const res = await getAllReviews({ page, limit, rating: filter });
    if (res?.success) {
      setReviews(res.data?.reviews ?? res.data ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filter, page]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this review?")) return;
    const res = await deleteReview(id);
    if (res?.success || res === "") {
      toast.success("Review deleted");
      load();
    } else toast.error("Failed");
  };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-bold text-gray-900">Reviews</h2>

      <div className="flex gap-2">
        {[undefined, 5, 4, 3, 2, 1].map((r) => (
          <button
            key={r ?? "all"}
            onClick={() => {
              setFilter(r);
              setPage(1);
            }}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-medium transition-all",
              filter === r
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-600",
            )}
          >
            {r === undefined ? "All" : `${r}★`}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No reviews found.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 hover:bg-gray-50/50 flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {r.user?.accountInfo?.firstName}{" "}
                      {r.user?.accountInfo?.lastName?.[0]}.
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          size={11}
                          className={cn(
                            j < r.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200 fill-gray-200",
                          )}
                        />
                      ))}
                    </div>
                    {r.isVerified && (
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  {r.product && (
                    <Link
                      href={`/products/${r.product.slug}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {r.product.name}
                    </Link>
                  )}
                  {r.title && (
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {r.title}
                    </p>
                  )}
                  {r.body && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {r.body}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(r.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">{total} reviews</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs text-gray-500">
                {page} / {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / limit)}
                className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
