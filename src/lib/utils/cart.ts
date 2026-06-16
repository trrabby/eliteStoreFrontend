import { DisplayCartItem } from "@/lib/hooks/useCartDisplay";

export function computeVendorShipping(
  items: DisplayCartItem[],
  baseRate: number,
  threshold: number = 4000,
): {
  totalShipping: number;
  vendorCount: number;
  vendors: { vendorId: number; subtotal: number }[];
} {
  const vendorMap = new Map<number, number>();
  for (const item of items) {
    const vendorId = item.vendorId;
    const itemTotal = item.price * item.quantity;
    vendorMap.set(vendorId, (vendorMap.get(vendorId) || 0) + itemTotal);
  }
  const totalSubtotal = Array.from(vendorMap.values()).reduce(
    (a, b) => a + b,
    0,
  );
  const vendorCount = vendorMap.size;

  let totalShipping = 0;
  if (totalSubtotal < threshold) {
    totalShipping = vendorCount * baseRate;
  }

  return {
    totalShipping,
    vendorCount,
    vendors: Array.from(vendorMap.entries()).map(([vendorId, subtotal]) => ({
      vendorId,
      subtotal,
    })),
  };
}
