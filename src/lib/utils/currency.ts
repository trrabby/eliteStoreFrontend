/* eslint-disable @typescript-eslint/no-explicit-any */
export const formatBDT = (
  amount: number | string,
  showSymbol: boolean = true,
  useBengaliNumerals: boolean = false,
): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  const formatted = new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

  if (useBengaliNumerals) {
    const bn = formatted.replace(/[0-9]/g, (d) =>
      String.fromCharCode(0x09e6 + parseInt(d)),
    );
    return showSymbol ? `৳ ${bn}` : bn;
  }

  return showSymbol ? `৳ ${formatted}` : formatted;
};

export const discountPercent = (
  price: number,
  comparePrice: number,
): number => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

// lib/utils/product.ts
export function computeVariantPrice(
  variantPrice: number,
  flashOffer: any | null,
): {
  salePrice: number;
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  hasDiscount: boolean;
} {
  const originalPrice = variantPrice;
  let salePrice = originalPrice;
  let discountPercent = 0;

  if (flashOffer) {
    const discountType = flashOffer.discountType;
    const discountValue = Number(flashOffer.discountValue);
    const maxDiscount = flashOffer.maxDiscount
      ? Number(flashOffer.maxDiscount)
      : null;

    if (discountType === "PERCENTAGE") {
      let amount = (originalPrice * discountValue) / 100;
      if (maxDiscount && amount > maxDiscount) amount = maxDiscount;
      salePrice = originalPrice - amount;
    } else if (discountType === "FLAT") {
      salePrice = originalPrice - discountValue;
    }
    salePrice = Math.max(0, salePrice);
    discountPercent =
      originalPrice > 0
        ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
        : 0;
  }

  return {
    salePrice,
    originalPrice,
    discountPercent,
    discountAmount: originalPrice - salePrice,
    hasDiscount: originalPrice > salePrice,
  };
}
