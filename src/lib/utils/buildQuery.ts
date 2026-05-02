/* eslint-disable @typescript-eslint/no-explicit-any */
export const buildQuery = (params: Record<string, any>): string => {
  const query = Object.entries(params).flatMap(([key, value]) => {
    if (value === undefined || value === null || value === "") return [];

    if (Array.isArray(value)) {
      return value.map(
        (v) => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`,
      );
    }

    return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
  });

  return query.length ? `?${query.join("&")}` : "";
};
