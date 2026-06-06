/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/hooks/useProductCreation.ts
import { useState } from "react";
import Swal from "sweetalert2";
import {
  createProduct,
  createVariant,
  addAttribute,
  addRelatedProducts,
  updateProduct,
  updateVariant,
  deleteAttribute,
  removeRelatedProduct as deleteRelatedProduct,
  getProductAttributes,
  getProductRelated,
  getProductVariants,
} from "@/services/product.service";
import { generateSKUFromVariant } from "@/lib/utils/skuGenerator";

export interface VariantOption {
  optionName: string;
  value: string;
}

export interface OptionType {
  name: string;
  values: string[];
}

export interface Variant {
  sku: string;
  name: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockAlert: number;
  weight?: number;
  barcode?: string;
  isDefault: boolean;
  isActive: boolean;
  options?: VariantOption[];
  id?: number; // Track if variant already exists in DB
  isDeleted?: boolean; // Track if variant should be deleted
}

export interface Attribute {
  name: string;
  value: string;
  id?: number;
}

export const useProductCreation = () => {
  const [saving, setSaving] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);
  const [existingVariants, setExistingVariants] = useState<Variant[]>([]);

  // Fetch existing variants from server
  const fetchExistingVariants = async (id: number) => {
    try {
      const res = await getProductVariants(id);
      if (res?.success && res.data?.variants) {
        const variantsWithIds = res.data.variants.map((v: any) => ({
          sku: v.sku,
          name: v.name,
          price: v.price,
          comparePrice: v.comparePrice,
          costPrice: v.costPrice,
          stock: v.stock,
          lowStockAlert: v.lowStockAlert,
          weight: v.weight,
          barcode: v.barcode,
          isDefault: v.isDefault,
          isActive: v.isActive,
          options: v.options || [],
          id: v.id,
        }));
        setExistingVariants(variantsWithIds);
        return variantsWithIds;
      }
    } catch (error) {
      console.error("Failed to fetch variants:", error);
    }
    return [];
  };

  // Basic Info - Create
  const createBasicInfo = async (data: any): Promise<number> => {
    const formData = new FormData();
    const productData = {
      name: data.name,
      shortDescription: data.shortDescription || undefined,
      description: data.description || undefined,
      categoryIds: data.categoryIds,
      brandId: data.brandId,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      status: data.status,
      isFeatured: data.isFeatured ?? false,
      metaTitle: data.metaTitle || undefined,
      metaDesc: data.metaDesc || undefined,
      metaKeywords: data.metaKeywords || undefined,
    };
    formData.append("data", JSON.stringify(productData));
    const res = await createProduct(formData);
    if (!res?.success) {
      throw new Error(res?.message || "Failed to create product");
    }
    const newProductId = res?.data?.product?.id;
    setProductId(newProductId);
    return newProductId;
  };

  // Basic Info - Update
  const updateBasicInfo = async (id: number, data: any) => {
    const formData = new FormData();
    const productData = {
      name: data.name,
      shortDescription: data.shortDescription || undefined,
      description: data.description || undefined,
      categoryIds: data.categoryIds,
      brandId: data.brandId,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      status: data.status,
      isFeatured: data.isFeatured ?? false,
      metaTitle: data.metaTitle || undefined,
      metaDesc: data.metaDesc || undefined,
      metaKeywords: data.metaKeywords || undefined,
    };
    formData.append("data", JSON.stringify(productData));
    const res = await updateProduct(id, formData);
    if (!res?.success) {
      throw new Error(res?.message || "Failed to update product");
    }
    return res;
  };

  // Variants - Create, Update, Delete intelligently
  const syncProductVariants = async (
    id: number,
    currentVariants: Variant[],
  ) => {
    // Fetch latest variants from server if not already fetched
    let serverVariants = existingVariants;
    if (serverVariants.length === 0) {
      serverVariants = await fetchExistingVariants(id);
    }

    // Separate variants by action needed
    const toCreate: Variant[] = [];
    const toUpdate: Variant[] = [];
    const toDelete: Variant[] = [];

    // Find variants to delete (exist in server but not in current state)
    for (const serverVariant of serverVariants) {
      const stillExists = currentVariants.some(
        (v) => v.id === serverVariant.id,
      );
      if (!stillExists) {
        toDelete.push(serverVariant);
      }
    }

    // Find variants to create or update
    for (const variant of currentVariants) {
      if (variant.id) {
        // Check if variant has changes
        const serverVariant = serverVariants.find((v) => v.id === variant.id);
        if (
          serverVariant &&
          JSON.stringify(serverVariant) !== JSON.stringify(variant)
        ) {
          toUpdate.push(variant);
        }
      } else {
        // New variant without ID
        toCreate.push(variant);
      }
    }

    const results = [];

    // Delete variants (soft delete by setting inactive)
    for (const variant of toDelete) {
      if (variant.id) {
        const res = await updateVariant(id, variant.id, {
          isActive: false,
        } as any);
        if (!res?.success) {
          console.error(`Failed to delete variant: ${variant.sku}`);
        }
        results.push({ action: "delete", variant, success: res?.success });
      }
    }

    // Create new variants and capture their IDs
    for (let i = 0; i < toCreate.length; i++) {
      const variant = toCreate[i];
      const sku = variant.sku || generateSKUFromVariant(variant.name);
      const formData = new FormData();
      const variantData = {
        sku,
        name: variant.name || undefined,
        price: variant.price,
        comparePrice: variant.comparePrice,
        costPrice: variant.costPrice,
        stock: variant.stock,
        lowStockAlert: variant.lowStockAlert,
        weight: variant.weight,
        barcode: variant.barcode,
        isDefault: variant.isDefault,
        isActive: variant.isActive,
        options: variant.options,
      };
      formData.append("data", JSON.stringify(variantData));
      const res = await createVariant(id, formData);

      if (!res?.success) {
        throw new Error(
          res?.message ||
            `Failed to create variant: ${variant.sku || variant.name}`,
        );
      }

      // Get the new variant ID from response - check different possible response structures
      const newVariantId =
        res?.data?.variant?.id || res?.data?.id || res?.data?.data?.id;

      if (newVariantId) {
        // Update the original variant object with the new ID
        variant.id = newVariantId;
        results.push({
          action: "create",
          variant: { ...variant, id: newVariantId },
          response: res,
          newId: newVariantId,
        });
      } else {
        console.error("No ID returned from create variant:", res);
        results.push({
          action: "create",
          variant,
          response: res,
          error: "No ID returned",
        });
      }
    }

    // Update existing variants
    for (const variant of toUpdate) {
      const sku = variant.sku || generateSKUFromVariant(variant.name);
      const formData = new FormData();
      const variantData = {
        sku,
        name: variant.name || undefined,
        price: variant.price,
        comparePrice: variant.comparePrice,
        costPrice: variant.costPrice,
        stock: variant.stock,
        lowStockAlert: variant.lowStockAlert,
        weight: variant.weight,
        barcode: variant.barcode,
        isDefault: variant.isDefault,
        isActive: variant.isActive,
        ...(variant.options?.length && { options: variant.options }),
      };
      formData.append("data", JSON.stringify(variantData));
      console.log(variantData);
      const res = await updateVariant(id, variant.id!, formData);
      if (!res?.success) {
        throw new Error(
          res?.message ||
            `Failed to update variant: ${variant.sku || variant.name}`,
        );
      }
      results.push({ action: "update", variant, response: res });
    }

    // Update local existing variants reference with the newly created IDs
    const updatedExistingVariants = currentVariants
      .filter((v) => v.id)
      .map((v) => ({ ...v }));
    setExistingVariants(updatedExistingVariants);

    // Return the updated variants with their IDs
    return {
      results,
      updatedVariants: currentVariants, // currentVariants now has IDs populated
    };
  };

  // Legacy function - kept for compatibility but recommend using syncProductVariants
  const createProductVariants = async (id: number, variants: Variant[]) => {
    return syncProductVariants(id, variants);
  };

  // Legacy function - kept for compatibility but recommend using syncProductVariants
  const updateProductVariants = async (id: number, variants: Variant[]) => {
    return syncProductVariants(id, variants);
  };

  // Attributes - Replace all (delete existing, add new)
  const saveProductAttributes = async (id: number, attributes: Attribute[]) => {
    try {
      // First, get existing attributes
      const existingRes = await getProductAttributes(id);

      // Delete all existing attributes
      if (existingRes?.success && existingRes.data) {
        for (const attr of existingRes.data) {
          await deleteAttribute(id, attr.id);
        }
      }

      // Add new attributes
      if (attributes.length > 0) {
        const formData = new FormData();
        formData.append("data", JSON.stringify({ attributes }));
        const res = await addAttribute(id, formData);
        if (!res?.success) {
          throw new Error(res?.message || "Failed to add attributes");
        }
        return res;
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error saving attributes:", error);
      throw new Error(error?.message || "Failed to save attributes");
    }
  };

  // Related Products - Replace all (delete existing, add new)
  const saveRelatedProducts = async (
    id: number,
    relatedProductIds: number[],
  ) => {
    try {
      // First, get existing related products
      const existingRes = await getProductRelated(id);

      // Delete all existing related products
      if (existingRes?.success && existingRes.data) {
        for (const related of existingRes.data) {
          await deleteRelatedProduct(id, related.relatedId);
        }
      }

      // Add new related products
      if (relatedProductIds.length > 0) {
        const formData = new FormData();
        formData.append("data", JSON.stringify({ relatedProductIds }));
        const res = await addRelatedProducts(id, formData);
        if (!res?.success) {
          throw new Error(res?.message || "Failed to add related products");
        }
        return res;
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error saving related products:", error);
      throw new Error(error?.message || "Failed to save related products");
    }
  };

  const showConfirmDialog = async (
    title: string,
    text: string,
  ): Promise<boolean> => {
    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#ffffff",
      color: "#111827",
      confirmButtonColor: "#7C3AED",
      cancelButtonColor: "#F3F4F6",
      customClass: {
        popup: "rounded-3xl border border-gray-100 shadow-2xl px-2",
        title: "text-lg font-bold text-gray-900",
        htmlContainer: "text-sm text-gray-500",
        confirmButton:
          "bg-primary text-white px-5 py-2.5 ml-2 rounded-xl cursor-pointer font-medium hover:opacity-90 transition",
        cancelButton:
          "bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition cursor-pointer",
      },
      buttonsStyling: false,
    });
    return result.isConfirmed;
  };

  const showSuccessDialog = async (
    title: string,
    text: string,
    confirmButtonText: string = "Continue",
  ): Promise<boolean> => {
    const result = await Swal.fire({
      title,
      text,
      icon: "success",
      confirmButtonText,
      confirmButtonColor: "#7C3AED",
      background: "#ffffff",
      customClass: {
        popup: "rounded-3xl",
        confirmButton:
          "bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition",
      },
      buttonsStyling: false,
    });
    return result.isConfirmed;
  };

  const showErrorDialog = async (
    title: string,
    text: string,
  ): Promise<void> => {
    await Swal.fire({
      title,
      text,
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#7C3AED",
      background: "#ffffff",
      customClass: {
        popup: "rounded-3xl",
        confirmButton:
          "bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition",
      },
      buttonsStyling: false,
    });
  };

  return {
    saving,
    setSaving,
    productId,
    setProductId,
    createBasicInfo,
    updateBasicInfo,
    createProductVariants,
    updateProductVariants,
    syncProductVariants,
    fetchExistingVariants,
    existingVariants,
    saveProductAttributes,
    saveRelatedProducts,
    showConfirmDialog,
    showSuccessDialog,
    showErrorDialog,
  };
};
