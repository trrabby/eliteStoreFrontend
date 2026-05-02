/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { buildQuery } from "@/lib/utils/buildQuery";
import { fetchWithAuth } from "./helpers";

// all inventory logs — admin
export const getAllInventoryLogs = async (params: {
  page?: number;
  limit?: number;
  variantId?: number;
  productId?: number;
  reason?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  try {
    return await fetchWithAuth(`/inventory${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

// variant inventory history
export const getVariantInventoryLogs = async (
  variantId: number,
  params: { page?: number; limit?: number },
) => {
  try {
    return await fetchWithAuth(
      `/inventory/variant/${variantId}${buildQuery(params)}`,
    );
  } catch (error: any) {
    return Error(error);
  }
};

// low stock alert list
export const getLowStockVariants = async (params: {
  page?: number;
  limit?: number;
  threshold?: number;
}) => {
  try {
    return await fetchWithAuth(`/inventory/low-stock${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

// out of stock list
export const getOutOfStockVariants = async (params: {
  page?: number;
  limit?: number;
}) => {
  try {
    return await fetchWithAuth(`/inventory/out-of-stock${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

// inventory stats — admin dashboard
export const getInventoryStats = async () => {
  try {
    return await fetchWithAuth("/inventory/stats");
  } catch (error: any) {
    return Error(error);
  }
};
