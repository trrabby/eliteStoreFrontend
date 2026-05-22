/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getMyReviews, deleteReview } from "@/services/review.service";
import { formatDate } from "@/lib/utils/date";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await getMyReviews({ limit: 20 });
    if (res?.success) setReviews(res.data?.reviews ?? res.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this review?")) return;
    const res = await deleteReview(id);
    if (res?.success) {
      toast.success("Review deleted");
      load();
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-bold text-gray-900">
        My Reviews
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center gap-3">
          <Star size={48} className="text-gray-200" />
          <p className="text-gray-500">No reviews written yet.</p>
          <Link href="/products" className="btn-primary px-6 py-2.5 text-sm">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5"
            >
              {/* Product */}
              {review.product && (
                <Link
                  href={`/products/${review.product.slug}`}
                  className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100 group"
                >
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-primary-pale shrink-0">
                    {review.product.images?.[0]?.url && (
                      <Image
                        src={review.product.images[0].url}
                        alt={review.product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                    {review.product.name}
                  </p>
                </Link>
              )}

              {/* Stars */}
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={13}
                    className={cn(
                      j < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200 fill-gray-200",
                    )}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-1">
                  {formatDate(review.createdAt)}
                </span>
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
                    Verified Purchase
                  </span>
                )}
                <button
                  onClick={() => handleDelete(review.id)}
                  className="ml-auto p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
