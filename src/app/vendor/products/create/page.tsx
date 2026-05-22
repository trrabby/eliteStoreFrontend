/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createProduct } from "@/services/product.service";
import { FormInput } from "@/components/shared/FormInput";

const schema = z.object({
  name: z.string().min(2, "Product name is required"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  categoryIds: z.string().min(1, "At least one category ID required"),
  brandId: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE"]),
  isFeatured: z.boolean().optional(),
  // variant fields
  sku: z.string().min(1, "SKU is required"),
  price: z.string().min(1, "Price is required"),
  comparePrice: z.string().optional(),
  stock: z.string().default("0"),
});

type FormData = z.input<typeof schema>;

export default function CreateProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "DRAFT", isFeatured: false, stock: "0" },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append(
        "data",
        JSON.stringify({
          name: data.name,
          shortDescription: data.shortDescription || undefined,
          description: data.description || undefined,
          categoryIds: data.categoryIds
            .split(",")
            .map((s) => Number(s.trim()))
            .filter(Boolean),
          brandId: data.brandId ? Number(data.brandId) : undefined,
          tags: data.tags
            ? data.tags
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          status: data.status,
          isFeatured: data.isFeatured ?? false,
        }),
      );

      const res = await createProduct(fd);
      if (!res?.success && !res?.product) {
        toast.error((res as any)?.message ?? "Failed to create product");
        return;
      }

      const productId = res.data?.product?.id ?? res.product?.id;

      // create default variant if product created
      if (productId) {
        const { createVariant } = await import("@/services/product.service");
        const vFd = new FormData();
        vFd.append(
          "data",
          JSON.stringify({
            sku: data.sku,
            price: Number(data.price),
            comparePrice: data.comparePrice
              ? Number(data.comparePrice)
              : undefined,
            stock: Number(data.stock),
            isDefault: true,
            isActive: true,
          }),
        );
        await createVariant(productId, vFd);
      }

      toast.success("Product created! Add images next.");
      router.push(`/vendor/products/${productId}/edit`);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Create Product
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic info */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Basic Information</h3>

          <FormInput
            label="Product Name"
            placeholder="e.g. Premium Cotton T-Shirt"
            error={errors.name?.message}
            required
            {...register("name")}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Short Description
            </label>
            <textarea
              {...register("shortDescription")}
              rows={2}
              placeholder="Brief summary shown on product cards..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Description
            </label>
            <textarea
              {...register("description")}
              rows={5}
              placeholder="Detailed product description (supports HTML)..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Category IDs (comma-separated)"
              placeholder="1, 5, 12"
              error={errors.categoryIds?.message}
              required
              {...register("categoryIds")}
            />
            <FormInput
              label="Brand ID (optional)"
              placeholder="3"
              type="number"
              {...register("brandId")}
            />
          </div>

          <FormInput
            label="Tags (comma-separated)"
            placeholder="cotton, summer, casual"
            {...register("tags")}
          />

          <div className="flex items-center gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <select
                {...register("status")}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
              </select>
            </div>

            <label className="flex items-center gap-2 mt-5 cursor-pointer">
              <input
                type="checkbox"
                className="accent-primary w-4 h-4"
                {...register("isFeatured")}
              />
              <span className="text-sm text-gray-700">Featured product</span>
            </label>
          </div>
        </div>

        {/* Default variant */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Default Variant</h3>
          <p className="text-xs text-gray-500">
            You can add more variants after creating the product.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <FormInput
                label="SKU"
                placeholder="PROD-001"
                error={errors.sku?.message}
                required
                {...register("sku")}
              />
            </div>
            <FormInput
              label="Price (৳)"
              type="number"
              placeholder="999"
              error={errors.price?.message}
              required
              {...register("price")}
            />
            <FormInput
              label="Compare Price (৳)"
              type="number"
              placeholder="1499"
              {...register("comparePrice")}
            />
          </div>

          <FormInput
            label="Initial Stock"
            type="number"
            placeholder="0"
            {...register("stock")}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary px-6 py-2.5 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <Save size={15} />
            )}
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
}
