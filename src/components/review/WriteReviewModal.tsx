/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, type FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Star, Upload, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { createReview, updateReview } from "@/services/review.service";
import Image from "next/image";

interface WriteReviewModalProps {
  productId: number;
  orderItemId?: number;
  initialData?: {
    id: number;
    rating: number;
    title: string;
    body: string;
    images: string[]; // array of image URLs
  };
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function WriteReviewModal({
  productId,
  orderItemId,
  initialData,
  onClose,
  onSuccess,
}: WriteReviewModalProps) {
  const isEditing = !!initialData;

  const [rating, setRating] = useState(initialData?.rating || 0);
  const [title, setTitle] = useState(initialData?.title || "");
  const [body, setBody] = useState(initialData?.body || "");

  // Image management
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData?.images || [],
  );
  const [newImages, setNewImages] = useState<File[]>([]);
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setTitle(initialData.title);
      setBody(initialData.body);
      setExistingImages(initialData.images || []);
    }
  }, [initialData]);

  // Combined preview list (existing images minus deleted + new images previews)
  const previewUrls = [
    ...existingImages.filter((url) => !deletedImageUrls.includes(url)),
    ...newImages.map((file) => URL.createObjectURL(file)),
  ];

  const totalImages = previewUrls.length;

  const handleRatingClick = (star: number) => setRating(star);
  const handleRatingHover = (star: number) => setHoveredStar(star);
  const handleRatingLeave = () => setHoveredStar(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const total = totalImages + newFiles.length;
    if (total > MAX_IMAGES) {
      toast.error(`You can upload up to ${MAX_IMAGES} images`);
      return;
    }

    const oversized = newFiles.some((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      toast.error(`Each image must be under 5MB`);
      return;
    }

    const invalidTypes = newFiles.some(
      (f) =>
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          f.type,
        ),
    );
    if (invalidTypes) {
      toast.error("Only JPEG, PNG, WebP, and GIF images are allowed");
      return;
    }

    setNewImages((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (urlOrIndex: string | number) => {
    if (typeof urlOrIndex === "string") {
      // It's an existing image URL
      setDeletedImageUrls((prev) => [...prev, urlOrIndex]);
    } else {
      // It's a new image index
      const index = urlOrIndex;
      setNewImages((prev) => prev.filter((_, i) => i !== index));
      // Revoke the blob URL (but we don't store it, so we just rely on cleanup)
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!body || body.trim().length < 10) {
      toast.error("Please write a review of at least 10 characters");
      return;
    }

    const formData = new FormData();
    const reviewData: Record<string, any> = {
      productId,
      rating,
      body: body.trim(),
    };
    if (orderItemId) reviewData.orderItemId = orderItemId;
    if (title.trim()) reviewData.title = title.trim();

    // Handle images for editing
    if (isEditing) {
      // Send remaining existing image URLs
      const remainingImages = existingImages.filter(
        (url) => !deletedImageUrls.includes(url),
      );
      reviewData.prevImg = remainingImages;
    }

    formData.append("data", JSON.stringify(reviewData));
    newImages.forEach((img) => formData.append("images", img));

    setLoading(true);
    const res = isEditing
      ? await updateReview(initialData!.id, formData)
      : await createReview(formData);
    setLoading(false);

    if (res?.success) {
      toast.success(isEditing ? "Review updated!" : "Review submitted!");
      onSuccess();
      onClose();
    } else {
      toast.error(res?.message || "Failed to submit review");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto
                   max-w-lg bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl font-bold text-gray-900">
            {isEditing ? "Edit Review" : "Write a Review"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rating *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => handleRatingHover(star)}
                  onMouseLeave={handleRatingLeave}
                  className="p-0.5 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={cn(
                      "transition-colors",
                      star <= (hoveredStar || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300 fill-gray-300",
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {rating > 0 ? `${rating} / 5` : "Select"}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Review Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Great product!"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              maxLength={100}
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your Review *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Share your experience with the product..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              minLength={10}
            />
            <p className="text-xs text-gray-400 mt-1">Minimum 10 characters</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Upload Images (Optional)
              <span className="text-xs text-gray-400 font-normal ml-1">
                (Max {MAX_IMAGES} images, 5MB each)
              </span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-4 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload size={18} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                Click to upload images
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            {previewUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {previewUrls.map((url, index) => {
                  // Determine if this is an existing or new image
                  const isExisting =
                    existingImages.includes(url) &&
                    !deletedImageUrls.includes(url);
                  const isNew = !isExisting;
                  return (
                    <div
                      key={isExisting ? url : `new-${index}`}
                      className="relative group"
                    >
                      <Image
                        src={url}
                        alt={`Image ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (isExisting) {
                            removeImage(url);
                          } else {
                            // Find the index of this new image in newImages
                            const newIdx = newImages.findIndex(
                              (_, i) =>
                                URL.createObjectURL(newImages[i]) === url,
                            );
                            if (newIdx !== -1) removeImage(newIdx);
                          }
                        }}
                        className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isEditing ? (
                "Update"
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
