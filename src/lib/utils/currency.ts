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

export interface CalculatedPriceResult {
  salePrice: number; // The final price the customer pays
  systemPrice: number; // The store's regular price (variant.price)
  basePrice: number; // The highest original sticker price (variant.comparePrice or fallback)
  totalDiscountPercent: number;
  totalDiscountAmount: number;
  hasDiscount: boolean;
  breakdown: {
    standardDiscountPercent: number;
    flashDiscountPercent: number;
    flashDiscountAmount: number;
  };
}

export function computeVariantPrice(
  variantPrice: number, // this is variant.price (the store's variant sale configuration)
  comparePrice: number | null | undefined, // this is variant.comparePrice (base sticker price)
  flashOffer: any | null,
): CalculatedPriceResult {
  const systemPrice = variantPrice;
  // If no comparePrice exists or it's lower than regular price, fall back to system price
  const basePrice =
    comparePrice && comparePrice > systemPrice ? comparePrice : systemPrice;

  let finalSalePrice = systemPrice;
  let flashDiscountAmount = 0;
  let flashDiscountPercent = 0;

  // 1. Calculate Flash Sale Deduction (Applied on top of systemPrice)
  if (flashOffer) {
    const discountType = flashOffer.discountType;
    const discountValue = Number(flashOffer.discountValue);
    const maxDiscount = flashOffer.maxDiscount
      ? Number(flashOffer.maxDiscount)
      : null;

    if (discountType === "PERCENTAGE") {
      flashDiscountAmount = (systemPrice * discountValue) / 100;
      if (maxDiscount && flashDiscountAmount > maxDiscount) {
        flashDiscountAmount = maxDiscount;
      }
    } else if (discountType === "FLAT") {
      flashDiscountAmount = discountValue;
    }

    flashDiscountAmount = Math.max(0, flashDiscountAmount);
    finalSalePrice = Math.max(0, systemPrice - flashDiscountAmount);

    flashDiscountPercent =
      systemPrice > 0
        ? Math.round((flashDiscountAmount / systemPrice) * 100)
        : 0;
  }

  // 2. Calculate Standard System Store Discount Percent (Base Price vs System Price)
  const standardDiscountPercent =
    basePrice > 0
      ? Math.round(((basePrice - systemPrice) / basePrice) * 100)
      : 0;

  // 3. Compute Aggregated Global Totals
  const totalDiscountAmount = Math.max(0, basePrice - finalSalePrice);
  const totalDiscountPercent =
    basePrice > 0 ? Math.round((totalDiscountAmount / basePrice) * 100) : 0;

  return {
    salePrice: finalSalePrice,
    systemPrice,
    basePrice,
    totalDiscountPercent,
    totalDiscountAmount,
    hasDiscount: basePrice > finalSalePrice,
    breakdown: {
      standardDiscountPercent,
      flashDiscountPercent,
      flashDiscountAmount,
    },
  };
}
