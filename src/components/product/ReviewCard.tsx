"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, ThumbsUp, Check } from "lucide-react";
import { timeAgo } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";
import { voteReview } from "@/services/review.service";

type ReviewCardProps = {
  review: {
    id: number;
    publicId: string;
    rating: number;
    title: string | null;
    body: string | null;
    images: string[];
    isVerified: boolean;
    helpfulCount: number;
    createdAt: string;
    user: {
      accountInfo: {
        firstName: string;
        lastName: string;
        avatar: string | null;
      } | null;
    };
  };
  index: number;
};

export function ReviewCard({ review, index }: ReviewCardProps) {
  const [helpful, setHelpful] = useState(review.helpfulCount);
  const [voted, setVoted] = useState(false);
  const [imgOpen, setImgOpen] = useState<string | null>(null);

  const name = review.user?.accountInfo
    ? `${review.user.accountInfo.firstName} ${review.user.accountInfo.lastName[0]}.`
    : "Anonymous";

  const handleHelpful = async () => {
    if (voted) return;
    setVoted(true);
    setHelpful((h) => h + 1);
    const fd = new FormData();
    fd.append("data", JSON.stringify({ isHelpful: true }));
    await voteReview(review.id, fd);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="bg-white rounded-2xl p-5 border border-gray-100
                 shadow-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full bg-gradient-primary
                          flex items-center justify-center text-white
                          text-sm font-bold flex-shrink-0 overflow-hidden"
          >
            {review.user?.accountInfo?.avatar ? (
              <Image
                src={review.user.accountInfo.avatar}
                alt={name}
                width={36}
                height={36}
                className="object-cover"
              />
            ) : (
              name[0]
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{name}</p>
            <p className="text-xs text-gray-400">{timeAgo(review.createdAt)}</p>
          </div>
        </div>

        {/* Verified badge */}
        {review.isVerified && (
          <span
            className="flex items-center gap-1 text-xs text-green-600
                           bg-green-50 px-2 py-0.5 rounded-full font-medium
                           flex-shrink-0"
          >
            <Check size={11} />
            Verified
          </span>
        )}
      </div>

      {/* Stars */}
      <div className="flex items-center gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={cn(
              i < review.rating
                ? "fill-amber-400 text-amber-400"
                : "text-gray-200 fill-gray-200",
            )}
          />
        ))}
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold text-gray-900 text-sm mb-1">
          {review.title}
        </h4>
      )}

      {/* Body */}
      {review.body && (
        <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
      )}

      {/* Images */}
      {review.images?.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {review.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setImgOpen(img)}
              className="relative w-16 h-16 rounded-xl overflow-hidden
                         border border-gray-200 hover:border-primary
                         transition-colors"
            >
              <Image
                src={img}
                alt={`Review image ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Helpful */}
      <div
        className="flex items-center gap-2 mt-3 pt-3 border-t
                      border-gray-50"
      >
        <span className="text-xs text-gray-400">Helpful?</span>
        <button
          onClick={handleHelpful}
          disabled={voted}
          className={cn(
            "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg",
            "transition-all duration-200",
            voted
              ? "bg-primary-pale text-primary font-medium"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
          )}
        >
          <ThumbsUp size={12} className={voted ? "fill-primary" : ""} />
          {helpful > 0 && helpful}
          {voted ? "Thanks!" : "Yes"}
        </button>
      </div>
    </motion.div>
  );
}
