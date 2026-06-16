/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/utils/shipping.ts
export function getBaseShippingRate(address: any): number {
  if (!address) return 130; // fallback
  const city = address.city_district?.toLowerCase() || "";
  return city === "dhaka" ? 70 : 130;
}
