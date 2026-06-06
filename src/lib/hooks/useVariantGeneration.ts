/* eslint-disable react-hooks/set-state-in-effect */
// hooks/useVariantGeneration.ts
import { useState, useCallback, useEffect } from "react";
import { Variant, VariantOption, OptionType } from "./useProductCreation";
import { generateSKUFromVariant } from "@/lib/utils/skuGenerator";

export const useVariantGeneration = () => {
  const [optionTypes, setOptionTypes] = useState<OptionType[]>([]);
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");
  const [generatedVariants, setGeneratedVariants] = useState<Variant[]>([]);

  // Load saved option types from localStorage
  useEffect(() => {
    const savedOptions = localStorage.getItem("variant_options");
    if (savedOptions) {
      try {
        const parsed = JSON.parse(savedOptions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOptionTypes(parsed);
        }
      } catch (error) {
        console.error("Failed to load saved options:", error);
      }
    }
  }, []);

  // Save option types to localStorage whenever they change
  useEffect(() => {
    if (optionTypes.length > 0) {
      localStorage.setItem("variant_options", JSON.stringify(optionTypes));
    } else {
      localStorage.removeItem("variant_options");
    }
  }, [optionTypes]);

  const addOptionType = useCallback(() => {
    if (newOptionName.trim() && newOptionValue.trim()) {
      const existingOption = optionTypes.find(
        (opt) => opt.name.toLowerCase() === newOptionName.trim().toLowerCase(),
      );
      if (existingOption) {
        // Add value to existing option if not already present
        const valueExists = existingOption.values.some(
          (v) => v.toLowerCase() === newOptionValue.trim().toLowerCase(),
        );
        if (!valueExists) {
          existingOption.values.push(newOptionValue.trim());
          setOptionTypes([...optionTypes]);
        } else {
          // Show feedback that value already exists
          console.warn(
            `Value "${newOptionValue}" already exists for option "${newOptionName}"`,
          );
        }
      } else {
        // Create new option type
        setOptionTypes([
          ...optionTypes,
          { name: newOptionName.trim(), values: [newOptionValue.trim()] },
        ]);
      }
      setNewOptionName("");
      setNewOptionValue("");
    }
  }, [newOptionName, newOptionValue, optionTypes]);

  const removeOptionValue = useCallback(
    (optionName: string, valueToRemove: string) => {
      const updatedOptions = optionTypes
        .map((opt) => {
          if (opt.name === optionName) {
            return {
              ...opt,
              values: opt.values.filter((v) => v !== valueToRemove),
            };
          }
          return opt;
        })
        .filter((opt) => opt.values.length > 0);
      setOptionTypes(updatedOptions);
    },
    [optionTypes],
  );

  const removeOptionType = useCallback(
    (optionName: string) => {
      setOptionTypes(optionTypes.filter((opt) => opt.name !== optionName));
    },
    [optionTypes],
  );

  const clearAllOptions = useCallback(() => {
    if (optionTypes.length > 0) {
      const confirmed = window.confirm(
        "Clear all option types? This will remove all unsaved combinations.",
      );
      if (confirmed) {
        setOptionTypes([]);
        setGeneratedVariants([]);
      }
    }
  }, [optionTypes]);

  const generateCombinations = useCallback((): VariantOption[][] => {
    if (optionTypes.length === 0) return [];

    const optionArrays = optionTypes.map((opt) =>
      opt.values.map((value) => ({ optionName: opt.name, value })),
    );

    const combinations: VariantOption[][] = [[]];
    for (const options of optionArrays) {
      const newCombinations: VariantOption[][] = [];
      for (const combination of combinations) {
        for (const option of options) {
          newCombinations.push([...combination, option]);
        }
      }
      combinations.length = 0;
      combinations.push(...newCombinations);
    }
    return combinations;
  }, [optionTypes]);

  const generateVariantsFromOptions = useCallback(
    (baseVariant: Partial<Variant>): Variant[] => {
      const combinations = generateCombinations();
      if (combinations.length === 0) return [];

      const basePrice = baseVariant.price || 0;
      const baseStock = baseVariant.stock || 0;
      const baseLowStockAlert = baseVariant.lowStockAlert || 5;

      const newVariants = combinations.map((combination, index) => {
        const variantName = combination.map((opt) => opt.value).join(" / ");
        const sku = generateSKUFromVariant(variantName);

        return {
          sku,
          name: variantName,
          price: basePrice,
          comparePrice: baseVariant.comparePrice,
          costPrice: baseVariant.costPrice,
          stock: baseStock,
          lowStockAlert: baseLowStockAlert,
          weight: baseVariant.weight,
          barcode: baseVariant.barcode || "",
          isDefault: index === 0,
          isActive: true,
          options: combination,
        };
      });

      setGeneratedVariants(newVariants);
      return newVariants;
    },
    [generateCombinations],
  );

  const updateVariantNameAndSKU = useCallback(
    (variants: Variant[], index: number, newName: string): Variant[] => {
      const updated = [...variants];
      const newSKU = generateSKUFromVariant(newName);
      updated[index] = {
        ...updated[index],
        name: newName,
        sku: newSKU,
      };
      return updated;
    },
    [],
  );

  const updateVariantOptions = useCallback(
    (
      variants: Variant[],
      index: number,
      options: VariantOption[],
    ): Variant[] => {
      const updated = [...variants];
      const variantName = options.map((opt) => opt.value).join(" / ");
      updated[index] = {
        ...updated[index],
        name: variantName,
        sku: generateSKUFromVariant(variantName),
        options,
      };
      return updated;
    },
    [],
  );

  const bulkUpdateVariants = useCallback(
    (variants: Variant[], updates: Partial<Variant>): Variant[] => {
      return variants.map((variant, index) => ({
        ...variant,
        ...updates,
        // If updating price or stock, don't override the name/sku
        name: updates.name !== undefined ? updates.name : variant.name,
        sku: updates.sku !== undefined ? updates.sku : variant.sku,
        // Keep isDefault only for first variant if not specified
        isDefault:
          updates.isDefault !== undefined
            ? updates.isDefault
            : index === 0
            ? true
            : false,
      }));
    },
    [],
  );

  const getCombinationCount = useCallback((): number => {
    if (optionTypes.length === 0) return 0;
    return optionTypes.reduce((total, opt) => total * opt.values.length, 1);
  }, [optionTypes]);

  const getOptionSummary = useCallback((): string => {
    if (optionTypes.length === 0) return "No options defined";
    const parts = optionTypes.map(
      (opt) => `${opt.values.length} ${opt.name}(s)`,
    );
    return parts.join(", ");
  }, [optionTypes]);

  const resetOptions = useCallback(() => {
    setOptionTypes([]);
    setGeneratedVariants([]);
    localStorage.removeItem("variant_options");
  }, []);

  return {
    // State
    optionTypes,
    newOptionName,
    newOptionValue,
    generatedVariants,

    // Setters
    setNewOptionName,
    setNewOptionValue,

    // Actions
    addOptionType,
    removeOptionValue,
    removeOptionType,
    clearAllOptions,
    resetOptions,

    // Generation
    generateCombinations,
    generateVariantsFromOptions,

    // Updates
    updateVariantNameAndSKU,
    updateVariantOptions,
    bulkUpdateVariants,

    // Utilities
    getCombinationCount,
    getOptionSummary,

    // Flags
    hasOptions: optionTypes.length > 0,
    totalCombinations: getCombinationCount(),
  };
};
