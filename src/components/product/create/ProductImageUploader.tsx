/* eslint-disable react-hooks/exhaustive-deps */
// components/product/create/ProductImageUploader.tsx
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ImagePlus, X, Star, Trash2, Upload } from "lucide-react";
import { ProductImage, useProductImages } from "@/lib/hooks/useProductImages";
import Image from "next/image";

interface ProductImageUploaderProps {
  productId: number | null;
  onImagesChange?: (images: ProductImage[]) => void;
}

export const ProductImageUploader = ({
  productId,
  onImagesChange,
}: ProductImageUploaderProps) => {
  const { images, uploading, uploadImages, setPrimary, deleteImage } =
    useProductImages(productId);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [altTexts, setAltTexts] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(files);
    setAltTexts(files.map(() => ""));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const fileList = new DataTransfer();
    selectedFiles.forEach((file) => fileList.items.add(file));

    const success = await uploadImages(fileList.files, altTexts);

    if (success) {
      setSelectedFiles([]);
      setAltTexts([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setAltTexts(altTexts.filter((_, i) => i !== index));
  };

  const updateAltText = (index: number, value: string) => {
    const newAltTexts = [...altTexts];
    newAltTexts[index] = value;
    setAltTexts(newAltTexts);
  };

  // Notify parent when images change
  useEffect(() => {
    if (onImagesChange) {
      onImagesChange(images);
    }
  }, [images]);

  return (
    <div className="card p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">Product Images</h3>
      <p className="text-xs text-gray-500">
        Upload product images. First image will be used as thumbnail. You can
        set a primary image.
      </p>

      {/* Existing Images */}
      {images.length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Product Images
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
              >
                <Image
                  src={image.url}
                  alt={image.altText || "Product image"}
                  className="w-full h-32 object-cover"
                  height={128}
                  width={128}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!image.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimary(image.id)}
                      className="p-1.5 bg-white rounded-full text-yellow-500 hover:bg-yellow-50 transition-colors"
                      title="Set as primary"
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteImage(image.id)}
                    className="p-1.5 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {image.isPrimary && (
                  <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Star size={10} /> Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3 border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-700">
            Images to Upload
          </label>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  height={48}
                  width={48}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <input
                    type="text"
                    value={altTexts[index]}
                    onChange={(e) => updateAltText(index, e.target.value)}
                    placeholder="Alt text (optional)"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:border-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSelectedFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedFiles([]);
                setAltTexts([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <Upload size={14} />
                  Upload {selectedFiles.length} Image(s)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="border-t border-gray-100 pt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="product-image-upload"
        />
        <label
          htmlFor="product-image-upload"
          className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-purple-50/30 transition-colors"
        >
          <ImagePlus size={20} className="text-gray-400" />
          <span className="text-sm text-gray-500">
            Click or drag to upload images
          </span>
        </label>
      </div>
    </div>
  );
};
