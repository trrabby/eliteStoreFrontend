/* eslint-disable @typescript-eslint/no-explicit-any */
// components/product/create/VariantItem.tsx (updated)
import { Trash2 } from "lucide-react";

import { motion } from "framer-motion";
import { Variant, VariantOption } from "@/lib/hooks/useProductCreation";

interface VariantItemProps {
  variant: Variant;
  index: number;
  isRemovable: boolean;
  onUpdate: (index: number, field: keyof Variant, value: any) => void;
  onRemove: (index: number, name: string) => void;
}

export const VariantItem = ({
  variant,
  index,
  isRemovable,
  onUpdate,
  onRemove,
}: VariantItemProps) => {
  const variantOptions = variant.options || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border border-gray-100 rounded-lg p-4 space-y-3 relative"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Variant {index + 1}
          </span>
          {variant.id && (
            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              Saved
            </span>
          )}
          {!variant.id && variant.name && (
            <span className="text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
              New
            </span>
          )}
          {variantOptions.length > 0 && (
            <div className="flex gap-1">
              {variantOptions.map((opt: VariantOption, optIdx: number) => (
                <span
                  key={optIdx}
                  className="text-xs px-1.5 py-0.5 bg-gray-100 rounded"
                >
                  {opt.value}
                </span>
              ))}
            </div>
          )}
        </div>
        {isRemovable && (
          <button
            type="button"
            onClick={() =>
              onRemove(index, variant.name || `Variant ${index + 1}`)
            }
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Variant Name
          </label>
          <input
            value={variant.name}
            onChange={(e) => onUpdate(index, "name", e.target.value)}
            placeholder="e.g. Red / Large"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            value={variant.sku}
            onChange={(e) => onUpdate(index, "sku", e.target.value)}
            placeholder="Auto-generated"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Barcode
          </label>
          <input
            value={variant.barcode || ""}
            onChange={(e) => onUpdate(index, "barcode", e.target.value)}
            placeholder="Optional barcode/UPC"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Price (৳)
          </label>
          <input
            type="number"
            step="0.01"
            value={variant.price}
            onChange={(e) =>
              onUpdate(index, "price", parseFloat(e.target.value))
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Compare Price (৳)
          </label>
          <input
            type="number"
            step="0.01"
            value={variant.comparePrice || ""}
            onChange={(e) =>
              onUpdate(
                index,
                "comparePrice",
                e.target.value ? parseFloat(e.target.value) : undefined,
              )
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Cost Price (৳)
          </label>
          <input
            type="number"
            step="0.01"
            value={variant.costPrice || ""}
            onChange={(e) =>
              onUpdate(
                index,
                "costPrice",
                e.target.value ? parseFloat(e.target.value) : undefined,
              )
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Stock
          </label>
          <input
            type="number"
            value={variant.stock}
            onChange={(e) => onUpdate(index, "stock", parseInt(e.target.value))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Low Stock Alert
          </label>
          <input
            type="number"
            value={variant.lowStockAlert}
            onChange={(e) =>
              onUpdate(index, "lowStockAlert", parseInt(e.target.value))
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.01"
            value={variant.weight || ""}
            onChange={(e) =>
              onUpdate(
                index,
                "weight",
                e.target.value ? parseFloat(e.target.value) : undefined,
              )
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={variant.isDefault}
            onChange={(e) => onUpdate(index, "isDefault", e.target.checked)}
            className="accent-primary w-3.5 h-3.5 cursor-pointer"
          />
          <span className="text-xs text-gray-700">Default Variant</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={variant.isActive}
            onChange={(e) => onUpdate(index, "isActive", e.target.checked)}
            className="accent-primary w-3.5 h-3.5 cursor-pointer"
          />
          <span className="text-xs text-gray-700">Active</span>
        </label>
      </div>
    </motion.div>
  );
};
