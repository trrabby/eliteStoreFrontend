/* eslint-disable react/no-unescaped-entities */
// components/product/create/BasicInfoStep.tsx
import { motion } from "framer-motion";
import { FormInput } from "@/components/shared/FormInput";
import { CategorySelector } from "./CategorySelector";
import { BrandSelector } from "./BrandSelector";
import { Category } from "@/lib/hooks/useCategories";
import { Brand } from "@/lib/hooks/useBrands";
import { Save } from "lucide-react";

interface BasicInfoData {
  name: string;
  shortDescription?: string;
  description?: string;
  tags?: string;
  status: string;
  isFeatured: boolean;
  metaTitle?: string;
  metaDesc?: string;
  metaKeywords?: string;
}

interface BasicInfoStepProps {
  data: BasicInfoData;
  onDataChange: (data: Partial<BasicInfoData>) => void;
  selectedCategories: Category[];
  onAddCategory: (category: Category) => void;
  onRemoveCategory: (categoryId: number, categoryName: string) => void;
  selectedBrand: Brand | null;
  onSelectBrand: (brand: Brand) => void;
  onClearBrand: () => void;
  errors: Record<string, string | undefined>;
  isCompleted?: boolean;
  onUpdate?: () => void;
  isUpdating?: boolean;
  hasChanges?: boolean;
}

export const BasicInfoStep = ({
  data,
  onDataChange,
  selectedCategories,
  onAddCategory,
  onRemoveCategory,
  selectedBrand,
  onSelectBrand,
  onClearBrand,
  errors,
  isCompleted = false,
  onUpdate,
  isUpdating = false,
  hasChanges = false,
}: BasicInfoStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Basic Information</h3>
        {isCompleted && hasChanges && onUpdate && (
          <button
            type="button"
            onClick={onUpdate}
            disabled={isUpdating}
            className="px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isUpdating ? (
              <div className="w-4 h-4 border-2 border-yellow-700/30 border-t-yellow-700 rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save Changes
          </button>
        )}
      </div>

      {isCompleted && !hasChanges && (
        <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
          ✓ Product information is up to date
        </div>
      )}

      {isCompleted && hasChanges && (
        <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
          ⚡ You have unsaved changes. Click "Save Changes" to update.
        </div>
      )}

      <FormInput
        label="Product Name"
        placeholder="e.g. Premium Cotton T-Shirt"
        value={data.name}
        onChange={(e) => onDataChange({ name: e.target.value })}
        error={errors.name}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Short Description
        </label>
        <textarea
          value={data.shortDescription || ""}
          onChange={(e) => onDataChange({ shortDescription: e.target.value })}
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
          value={data.description || ""}
          onChange={(e) => onDataChange({ description: e.target.value })}
          rows={5}
          placeholder="Detailed product description (supports HTML)..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      <CategorySelector
        selectedCategories={selectedCategories}
        onAddCategory={onAddCategory}
        onRemoveCategory={onRemoveCategory}
        error={errors.categoryIds}
      />

      <BrandSelector
        selectedBrand={selectedBrand}
        onSelectBrand={onSelectBrand}
        onClearBrand={onClearBrand}
      />

      <FormInput
        label="Tags (comma-separated)"
        placeholder="cotton, summer, casual"
        value={data.tags || ""}
        onChange={(e) => onDataChange({ tags: e.target.value })}
      />

      <div className="flex items-center gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Status
          </label>
          <select
            value={data.status}
            onChange={(e) => onDataChange({ status: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary cursor-pointer"
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="DISCONTINUED">Discontinued</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <label className="flex items-center gap-2 mt-5 cursor-pointer">
          <input
            type="checkbox"
            checked={data.isFeatured}
            onChange={(e) => onDataChange({ isFeatured: e.target.checked })}
            className="accent-primary w-4 h-4 cursor-pointer"
          />
          <span className="text-sm text-gray-700">Featured product</span>
        </label>
      </div>

      <div className="border-t border-gray-100 pt-4 mt-2">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          SEO Information (Optional)
        </h4>
        <FormInput
          label="Meta Title"
          placeholder="SEO title for search engines"
          value={data.metaTitle || ""}
          onChange={(e) => onDataChange({ metaTitle: e.target.value })}
        />
        <FormInput
          label="Meta Description"
          placeholder="SEO description"
          value={data.metaDesc || ""}
          onChange={(e) => onDataChange({ metaDesc: e.target.value })}
        />
        <FormInput
          label="Meta Keywords"
          placeholder="keyword1, keyword2, keyword3"
          value={data.metaKeywords || ""}
          onChange={(e) => onDataChange({ metaKeywords: e.target.value })}
        />
      </div>
    </motion.div>
  );
};
