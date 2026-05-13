"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type OptionValue = {
  optionId: number;
  optionName: string;
  value: string;
};

type Variant = {
  id: number;
  publicId: string;
  name: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  isDefault: boolean;
  isActive: boolean;
  optionValues: {
    value: {
      value: string;
      option: { name: string };
    };
  }[];
};

type VariantSelectorProps = {
  variants: Variant[];
  selectedVariant: Variant | null;
  onSelect: (variant: Variant) => void;
};

// group variants by option (Color, Size, etc.)
const groupOptions = (variants: Variant[]) => {
  const map = new Map<string, Set<string>>();

  for (const variant of variants) {
    for (const ov of variant.optionValues) {
      const optName = ov.value.option.name;
      if (!map.has(optName)) map.set(optName, new Set());
      map.get(optName)!.add(ov.value.value);
    }
  }

  return map;
};

// find variant that matches selected combination
const findVariant = (
  variants: Variant[],
  selection: Record<string, string>,
): Variant | null => {
  return (
    variants.find((v) => {
      const opts = Object.fromEntries(
        v.optionValues.map((ov) => [ov.value.option.name, ov.value.value]),
      );
      return Object.entries(selection).every(([key, val]) => opts[key] === val);
    }) ?? null
  );
};

const COLOR_VALUES: Record<string, string> = {
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#22C55E",
  yellow: "#EAB308",
  black: "#1F2937",
  white: "#F9FAFB",
  pink: "#EC4899",
  purple: "#A855F7",
  orange: "#F97316",
  gray: "#9CA3AF",
  brown: "#92400E",
  navy: "#1E3A5F",
};

export function VariantSelector({
  variants,
  selectedVariant,
  onSelect,
}: VariantSelectorProps) {
  if (!variants?.length) return null;

  // for single-variant products
  if (variants.length === 1 && !variants[0].optionValues.length) {
    return null;
  }

  const optionGroups = groupOptions(variants);

  // current selection state derived from selectedVariant
  const currentSelection = Object.fromEntries(
    selectedVariant?.optionValues.map((ov) => [
      ov.value.option.name,
      ov.value.value,
    ]) ?? [],
  );

  const handleOptionSelect = (optionName: string, value: string) => {
    const newSelection = { ...currentSelection, [optionName]: value };
    const found = findVariant(variants, newSelection);
    if (found) onSelect(found);
  };

  const isColorOption = (name: string) =>
    name.toLowerCase().includes("color") ||
    name.toLowerCase().includes("colour");

  return (
    <div className="space-y-4">
      {Array.from(optionGroups.entries()).map(([optionName, values]) => {
        const isColor = isColorOption(optionName);
        const selected = currentSelection[optionName];

        return (
          <div key={optionName}>
            <p className="text-sm font-semibold text-gray-900 mb-2.5">
              {optionName}:{" "}
              <span className="font-normal text-primary">{selected}</span>
            </p>

            <div className="flex flex-wrap gap-2">
              {Array.from(values).map((value) => {
                const hexColor = COLOR_VALUES[value.toLowerCase()];
                const isSelected = selected === value;

                // check if this value leads to any in-stock variant
                const testSelection = {
                  ...currentSelection,
                  [optionName]: value,
                };
                const testVariant = findVariant(variants, testSelection);
                const isOutOfStock = testVariant
                  ? testVariant.stock === 0
                  : false;
                const isUnavailable = !testVariant || !testVariant.isActive;

                if (isColor && hexColor) {
                  return (
                    <motion.button
                      key={value}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        !isUnavailable && handleOptionSelect(optionName, value)
                      }
                      disabled={isUnavailable}
                      className={cn(
                        "w-9 h-9 rounded-full border-2 transition-all",
                        "relative flex items-center justify-center",
                        isSelected
                          ? "border-primary ring-2 ring-primary/30 scale-110"
                          : "border-transparent hover:border-gray-300",
                        isUnavailable && "opacity-40 cursor-not-allowed",
                      )}
                      title={value}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-black/10"
                        style={{ backgroundColor: hexColor }}
                      />
                      {isOutOfStock && (
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background:
                              "repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(0,0,0,0.2) 3px, rgba(0,0,0,0.2) 4px)",
                          }}
                        />
                      )}
                    </motion.button>
                  );
                }

                return (
                  <motion.button
                    key={value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      !isUnavailable && handleOptionSelect(optionName, value)
                    }
                    disabled={isUnavailable}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-sm font-medium",
                      "border-2 transition-all duration-200 relative",
                      isSelected
                        ? "border-primary bg-primary-pale text-primary"
                        : "border-gray-200 text-gray-700 hover:border-gray-300",
                      isUnavailable && "opacity-40 cursor-not-allowed",
                      isOutOfStock && "line-through",
                    )}
                  >
                    {value}
                    {isOutOfStock && (
                      <span
                        className="absolute -top-1.5 -right-1.5 w-3 h-3
                                       bg-red-500 rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
