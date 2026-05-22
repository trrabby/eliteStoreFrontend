/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Plus,
  Save,
  Image as ImgIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  getProductById,
  updateProduct,
  addProductImages,
  deleteProductImage,
  createVariant,
  updateVariant,
  updateStock,
} from "@/services/product.service";
import { FormInput } from "@/components/shared/FormInput";
import { formatBDT } from "@/lib/utils/currency";

export default function EditProductPage() {
  const { id } = useParams();
  console.log(id);
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await getProductById(Number(id));
      if (res?.success) {
        const p = res.data;
        setProduct(p);
        setName(p.name ?? "");
        setShortDesc(p.shortDescription ?? "");
        setDescription(p.description ?? "");
        setStatus(p.status ?? "DRAFT");
        setIsFeatured(p.isFeatured ?? false);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append(
        "data",
        JSON.stringify({
          name,
          shortDescription: shortDesc,
          description,
          status,
          isFeatured,
        }),
      );
      const res = await updateProduct(Number(id), fd);
      if (res?.success) toast.success("Product updated!");
      else toast.error((res as any)?.message ?? "Failed");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f));
      const res = await addProductImages(Number(id), fd);
      if (res?.success) {
        toast.success("Images uploaded!");
        // reload product
        const refreshed = await getProductById(Number(id));
        if (refreshed?.success) setProduct(refreshed.data);
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Delete this image?")) return;
    const { deleteProductImage: delImg } =
      await import("@/services/product.service");
    const res = await delImg(Number(id), imageId);
    if (res?.success) {
      toast.success("Image deleted");
      setProduct((prev: any) => ({
        ...prev,
        images: prev.images.filter((img: any) => img.id !== imageId),
      }));
    } else {
      toast.error("Failed to delete");
    }
  };

  const handleStockUpdate = async (variantId: number, change: number) => {
    const fd = new FormData();
    fd.append("data", JSON.stringify({ change, reason: "MANUAL_ADJUSTMENT" }));
    const res = await updateStock(Number(id), variantId, fd);
    if (res?.success) {
      toast.success("Stock updated");
      setProduct((prev: any) => ({
        ...prev,
        variants: prev.variants.map((v: any) =>
          v.id === variantId ? { ...v, stock: v.stock + change } : v,
        ),
      }));
    } else {
      toast.error((res as any)?.message ?? "Failed");
    }
  };

  if (loading)
    return (
      <div className="space-y-4 max-w-3xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    );

  if (!product)
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500">Product not found.</p>
        <button
          onClick={() => router.back()}
          className="btn-primary px-6 py-2.5 text-sm mt-4"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-display text-xl font-bold text-gray-900 truncate">
          {product.name}
        </h2>
        <span
          className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
            product.status === "ACTIVE"
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {product.status}
        </span>
      </div>

      {/* Images */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <ImgIcon size={15} className="text-primary" />
            Images
          </h3>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-60"
          >
            {uploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full"
              />
            ) : (
              <Upload size={13} />
            )}
            Upload
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUploadImages}
          />
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {product.images?.map((img: any) => (
            <div
              key={img.id}
              className="relative group aspect-square rounded-xl overflow-hidden bg-primary-pale"
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
              {img.isPrimary && (
                <span className="absolute top-1 left-1 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">
                  Main
                </span>
              )}
              <button
                onClick={() => handleDeleteImage(img.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
          {!product.images?.length && (
            <div
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary text-gray-400 hover:text-primary transition-all col-span-2"
            >
              <Upload size={20} />
              <span className="text-xs">Add images</span>
            </div>
          )}
        </div>
      </div>

      {/* Basic info */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-gray-900">Product Info</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Short Description
          </label>
          <textarea
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div className="flex items-center gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <label className="flex items-center gap-2 mt-5 cursor-pointer">
            <input
              type="checkbox"
              className="accent-primary w-4 h-4"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            <span className="text-sm text-gray-700">Featured</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <Save size={14} />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Variants */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">
          Variants & Inventory
        </h3>
        <div className="space-y-3">
          {product.variants?.map((v: any) => (
            <div key={v.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {v.name ?? "Default Variant"}
                  </p>
                  <p className="text-xs text-gray-400">SKU: {v.sku}</p>
                  <p className="text-sm font-bold text-primary mt-0.5">
                    {formatBDT(v.price)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Stock</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStockUpdate(v.id, -1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-red-300 hover:text-red-500 transition-all text-sm font-bold"
                      >
                        −
                      </button>
                      <span
                        className={`text-sm font-bold min-w-[2rem] text-center ${
                          v.stock === 0
                            ? "text-red-500"
                            : v.stock < 10
                              ? "text-amber-500"
                              : "text-green-600"
                        }`}
                      >
                        {v.stock}
                      </span>
                      <button
                        onClick={() => handleStockUpdate(v.id, 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-green-300 hover:text-green-500 transition-all text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
