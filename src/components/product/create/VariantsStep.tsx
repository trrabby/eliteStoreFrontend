/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
// components/product/create/VariantsStep.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Save } from "lucide-react";
import { Variant, VariantOption } from "@/lib/hooks/useProductCreation";
import { useVariantGeneration } from "@/lib/hooks/useVariantGeneration";
import { VariantOptionBuilder } from "./VariantOptionBuilder";
import { VariantItem } from "./VariantItem";

interface VariantsStepProps {
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
  onNext: () => void;
  onBack: () => void;
  saving: boolean;
  isCompleted?: boolean;
  onUpdate?: () => void;
  hasChanges?: boolean;
}

export const VariantsStep = ({
  variants,
  onVariantsChange,
  onNext,
  onBack,
  saving,
  isCompleted = false,
  onUpdate,
  hasChanges = false,
}: VariantsStepProps) => {
  const {
    optionTypes,
    newOptionName,
    newOptionValue,
    setNewOptionName,
    setNewOptionValue,
    addOptionType,
    removeOptionValue,
    removeOptionType,
    generateVariantsFromOptions,
    updateVariantNameAndSKU,
    hasOptions,
  } = useVariantGeneration();

  const handleGenerateVariants = () => {
    const baseVariant = variants[0] || {
      price: 0,
      stock: 0,
      lowStockAlert: 5,
    };
    const newVariants = generateVariantsFromOptions(baseVariant);
    if (newVariants.length > 0) {
      onVariantsChange(newVariants);
    }
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants];

    if (field === "name") {
      // Update SKU automatically when name changes
      const updatedVariants = updateVariantNameAndSKU(updated, index, value);
      onVariantsChange(updatedVariants);
    } else {
      updated[index] = { ...updated[index], [field]: value };
      onVariantsChange(updated);
    }
  };

  const removeVariant = async (index: number, name: string) => {
    const confirmed = window.confirm(`Remove variant "${name}"?`);
    if (confirmed) {
      const updated = variants.filter((_, i) => i !== index);
      // If we removed the default variant, set the first one as default
      if (updated.length > 0 && variants[index].isDefault) {
        updated[0].isDefault = true;
      }
      onVariantsChange(updated);
    }
  };

  const addSingleVariant = () => {
    const newVariant: Variant = {
      sku: "",
      name: "",
      price: 0,
      comparePrice: undefined,
      costPrice: undefined,
      stock: 0,
      lowStockAlert: 5,
      weight: undefined,
      barcode: "",
      isDefault: variants.length === 0,
      isActive: true,
      options: [],
      id: undefined, // No ID means it's a new variant
    };
    onVariantsChange([...variants, newVariant]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <VariantOptionBuilder
        optionTypes={optionTypes}
        newOptionName={newOptionName}
        newOptionValue={newOptionValue}
        onNewOptionNameChange={setNewOptionName}
        onNewOptionValueChange={setNewOptionValue}
        onAddOption={addOptionType}
        onRemoveOptionValue={removeOptionValue}
        onRemoveOptionType={removeOptionType}
        onGenerateVariants={handleGenerateVariants}
        canGenerate={hasOptions}
      />

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Product Variants</h3>
          <div className="flex gap-2">
            {isCompleted && hasChanges && onUpdate && (
              <button
                type="button"
                onClick={onUpdate}
                disabled={saving}
                className="px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-yellow-700/30 border-t-yellow-700 rounded-full animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save Changes
              </button>
            )}
            <button
              type="button"
              onClick={addSingleVariant}
              disabled={saving}
              className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={14} />
              Add Single Variant
            </button>
          </div>
        </div>

        {isCompleted && !hasChanges && variants.length > 0 && (
          <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            ✓ All variants are up to date
          </div>
        )}

        {isCompleted && hasChanges && (
          <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            ⚡ You have unsaved variant changes. Click "Save Changes" to update.
          </div>
        )}

        <p className="text-xs text-gray-500">
          Each variant represents a specific combination of options with its own
          price and stock.
        </p>

        <AnimatePresence>
          {variants.map((variant, index) => (
            <VariantItem
              key={index}
              variant={variant}
              index={index}
              isRemovable={variants.length > 1}
              onUpdate={updateVariant}
              onRemove={removeVariant}
            />
          ))}
        </AnimatePresence>

        {variants.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No variants yet. Add a single variant or use the option builder
            above.
          </p>
        )}
      </div>
    </motion.div>
  );
};
