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
    return showSymbol ? `৳${bn}` : bn;
  }

  return showSymbol ? `৳${formatted}` : formatted;
};

export const discountPercent = (
  price: number,
  comparePrice: number,
): number => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};
