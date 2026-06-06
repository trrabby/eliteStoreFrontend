// lib/utils/simple-sku-generator.ts

/**
 * Simple SKU Generator
 * Generates SKU from variant name
 */

/**
 * Generate SKU from variant name
 */
export function generateSKUFromVariant(variantName: string): string {
  if (!variantName || variantName.trim() === "") {
    return "";
  }

  return variantName
    .trim()
    .toUpperCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single
}
