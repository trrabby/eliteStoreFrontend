/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useProductImages.ts
import { useState } from "react";
import { toast } from "sonner";
import {
  addProductImages,
  setPrimaryImage,
  deleteProductImage,
} from "@/services/product.service";

export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

export const useProductImages = (productId: number | null) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const uploadImages = async (files: FileList, altTexts: string[]) => {
    if (!productId) {
      toast.error("Product not found");
      return false;
    }

    if (files.length === 0) return false;

    setUploading(true);
    const toastId = toast.loading(`Uploading ${files.length} image(s)...`);

    try {
      const formData = new FormData();

      // Append each file with its alt text
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
        if (altTexts[i]) {
          formData.append(`altText_${i}`, altTexts[i]);
        }
      }

      const res = await addProductImages(productId, formData);

      if (res?.success && res.data?.images) {
        setImages((prev) => [...prev, ...res.data.images]);
        toast.success(`${files.length} image(s) uploaded successfully`, {
          id: toastId,
        });
        return true;
      } else {
        throw new Error(res?.message || "Upload failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload images", { id: toastId });
      return false;
    } finally {
      setUploading(false);
    }
  };

  const setPrimary = async (imageId: number) => {
    if (!productId) return false;

    const toastId = toast.loading("Setting primary image...");

    try {
      const res = await setPrimaryImage(productId, imageId);

      if (res?.success) {
        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            isPrimary: img.id === imageId,
          })),
        );
        toast.success("Primary image set", { id: toastId });
        return true;
      } else {
        throw new Error(res?.message || "Failed to set primary image");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to set primary image", {
        id: toastId,
      });
      return false;
    }
  };

  const deleteImage = async (imageId: number) => {
    if (!productId) return false;

    const toastId = toast.loading("Deleting image...");

    try {
      const res = await deleteProductImage(productId, imageId);

      if (res?.success) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
        toast.success("Image deleted", { id: toastId });
        return true;
      } else {
        throw new Error(res?.message || "Failed to delete image");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete image", { id: toastId });
      return false;
    }
  };

  return {
    images,
    setImages,
    uploading,
    uploadImages,
    setPrimary,
    deleteImage,
  };
};
