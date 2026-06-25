/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Star,
  ThumbsUp,
  Check,
  Pencil,
  X,
  ZoomIn,
  ZoomOut,
  Move,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { timeAgo } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { useState, useRef, useEffect, useCallback } from "react";
import { voteReview } from "@/services/review.service";
import { WriteReviewModal } from "@/components/modals/WriteReviewModal";

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
    hasVoted?: boolean;
    createdAt: string;
    user: {
      id: number;
      accountInfo: {
        firstName: string;
        lastName: string;
        avatar: string | null;
      } | null;
    };
  };
  productId: number;
  orderItemId?: number;
  index: number;
  currentUser: any;
  onEdit: () => void;
};

export function ReviewCard({
  review,
  productId,
  orderItemId,
  index,
  currentUser,
  onEdit,
}: ReviewCardProps) {
  const [helpful, setHelpful] = useState(review.helpfulCount);
  const [hasVoted, setHasVoted] = useState(review.hasVoted || false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const isAuthor = currentUser?.id === review.user.id;
  const images = review.images || [];
  const totalImages = images.length;

  const name = review.user?.accountInfo
    ? `${review.user.accountInfo.firstName} ${review.user.accountInfo.lastName[0]}.`
    : "Anonymous";

  // Reset zoom and pan when lightbox opens
  useEffect(() => {
    if (lightboxIndex !== null) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [lightboxIndex]);

  const handleHelpful = async () => {
    if (hasVoted || isAuthor) return;
    setHasVoted(true);
    setHelpful((h) => h + 1);
    const fd = new FormData();
    fd.append("data", JSON.stringify({ isHelpful: true }));
    await voteReview(review.id, fd);
  };

  // Image navigation
  const goToPrev = useCallback(() => {
    if (lightboxIndex === null || totalImages === 0) return;
    setLightboxIndex((prev) => (prev === 0 ? totalImages - 1 : prev! - 1));
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [lightboxIndex, totalImages]);

  const goToNext = useCallback(() => {
    if (lightboxIndex === null || totalImages === 0) return;
    setLightboxIndex((prev) => (prev === totalImages - 1 ? 0 : prev! + 1));
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [lightboxIndex, totalImages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, goToPrev, goToNext]);

  // Zoom controls
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 1));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  // Pan drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPan({ x: newX, y: newY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.07 }}
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card relative group"
      >
        {/* Edit button (only for author) */}
        {isAuthor && (
          <button
            onClick={() => setShowEditModal(true)}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition opacity-0 group-hover:opacity-100"
            title="Edit review"
          >
            <Pencil size={14} />
          </button>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
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
              <p className="text-xs text-gray-400">
                {timeAgo(review.createdAt)}
              </p>
            </div>
          </div>

          {review.isVerified && (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium shrink-0">
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

        {review.title && (
          <h4 className="font-semibold text-gray-900 text-sm mb-1">
            {review.title}
          </h4>
        )}
        {review.body && (
          <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
        )}

        {/* Images */}
        {images.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 hover:border-primary transition-colors"
              >
                <Image
                  src={img}
                  alt={`Review image ${i + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
                {i === 2 && images.length > 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold">
                    +{images.length - 3}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Helpful */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">Helpful?</span>
          <button
            onClick={handleHelpful}
            disabled={hasVoted || isAuthor}
            title={isAuthor ? "You cannot vote on your own review" : ""}
            className={cn(
              "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all duration-200",
              hasVoted
                ? "bg-primary-pale text-primary font-medium"
                : isAuthor
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
            )}
          >
            <ThumbsUp size={12} className={hasVoted ? "fill-primary" : ""} />
            {helpful > 0 && helpful}
            {hasVoted ? "Thanks!" : isAuthor ? "Your own" : "Yes"}
          </button>
        </div>
      </motion.div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && currentImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxIndex(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 "
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-10 z-50 flex items-center justify-center w-2/3 mx-auto"
            >
              <div className="relative w-full h-full bg-black/90 rounded-3xl overflow-hidden">
                {/* Close button */}
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-sm"
                >
                  <X size={24} />
                </button>

                {/* Image counter */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white/80 text-sm font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                  {lightboxIndex + 1} / {totalImages}
                </div>

                {/* Navigation arrows */}
                {totalImages > 1 && (
                  <>
                    <button
                      onClick={goToPrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-sm"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-sm"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Zoom controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                  <button
                    onClick={zoomOut}
                    disabled={zoom <= 1}
                    className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition"
                  >
                    <ZoomOut size={18} className="text-white" />
                  </button>
                  <span className="text-white text-sm font-mono min-w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    disabled={zoom >= 4}
                    className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition"
                  >
                    <ZoomIn size={18} className="text-white" />
                  </button>
                  <div className="w-px h-6 bg-white/20" />
                  <button
                    onClick={resetZoom}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition"
                  >
                    <Move size={18} className="text-white" />
                  </button>
                </div>

                {/* Image container */}
                <div
                  ref={imageContainerRef}
                  className="relative w-full h-full cursor-grab active:cursor-grabbing"
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <div
                    className="relative w-full h-full transition-transform duration-75 ease-out"
                    style={{
                      transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${
                        pan.y / zoom
                      }px)`,
                      transformOrigin: "center center",
                    }}
                  >
                    <Image
                      src={currentImage}
                      alt={`Review image ${lightboxIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="90vw"
                    />
                  </div>
                </div>

                {zoom > 1 && (
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-xs bg-black/30 px-3 py-1 rounded-full">
                    Drag to pan • Scroll to zoom
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <WriteReviewModal
            productId={productId}
            orderItemId={orderItemId}
            initialData={{
              id: review.id,
              rating: review.rating,
              title: review.title || "",
              body: review.body || "",
              images: review.images || [],
            }}
            onClose={() => setShowEditModal(false)}
            onSuccess={() => {
              setShowEditModal(false);
              onEdit();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
