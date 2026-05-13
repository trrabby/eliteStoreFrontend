/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { buildQuery } from "@/lib/utils/buildQuery";
import { fetchPublic, fetchWithAuth } from "./helpers";

// ─────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────

// active flash sales for homepage
export const getActiveFlashSales = async () => {
  try {
    return await fetchPublic("/flash-sales/active", {}, 0);
  } catch (error: any) {
    return Error(error);
  }
};

// all public active flash sales
export const getAllFlashSales = async (params?: {
  page?: number;
  limit?: number;
}) => {
  try {
    return await fetchPublic(`/flash-sales${buildQuery(params || {})}`, {}, 0);
  } catch (error: any) {
    return Error(error);
  }
};

// single flash sale by slug
export const getFlashSaleBySlug = async (slug: string) => {
  try {
    return await fetchPublic(`/flash-sales/${slug}`, {}, 0);
  } catch (error: any) {
    return Error(error);
  }
};

// ─────────────────────────────────────────
// VENDOR + ADMIN
// ─────────────────────────────────────────

// my flash sales
export const getMyFlashSales = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  try {
    return await fetchWithAuth(
      `/flash-sales/my/sales${buildQuery(params || {})}`,
    );
  } catch (error: any) {
    return Error(error);
  }
};

// create flash sale
export const createFlashSale = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/flash-sales/create", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// update draft flash sale
export const updateFlashSale = async (publicId: string, formData: FormData) => {
  try {
    return await fetchWithAuth(`/flash-sales/update-draft/${publicId}`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// add items in bulk
export const addFlashSaleItems = async (
  publicId: string,
  formData: FormData,
) => {
  try {
    return await fetchWithAuth(`/flash-sales/${publicId}/items`, {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// update single item
export const updateFlashSaleItem = async (
  itemPublicId: string,
  formData: FormData,
) => {
  try {
    return await fetchWithAuth(`/flash-sales/update-item/${itemPublicId}`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// remove single item
export const removeFlashSaleItem = async (itemPublicId: string) => {
  try {
    return await fetchWithAuth(`/flash-sales/delete-item/${itemPublicId}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// remove bulk items
export const removeBulkFlashSaleItems = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/flash-sales/removeBulkItems", {
      method: "DELETE",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// activate flash sale
export const activateFlashSale = async (
  publicId: string,
  formData: FormData,
) => {
  try {
    return await fetchWithAuth(`/flash-sales/${publicId}/activate`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// cancel flash sale
export const cancelFlashSale = async (publicId: string) => {
  try {
    return await fetchWithAuth(`/flash-sales/${publicId}/cancel`, {
      method: "PATCH",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// delete draft flash sale
export const deleteFlashSale = async (publicId: string) => {
  try {
    return await fetchWithAuth(`/flash-sales/delete-draft/${publicId}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// ─────────────────────────────────────────
// ADMIN ONLY
// ─────────────────────────────────────────

// all flash sales (admin)
export const getAdminFlashSales = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  vendorId?: number;
  isActive?: boolean;
}) => {
  try {
    return await fetchWithAuth(
      `/flash-sales/admin/all${buildQuery(params || {})}`,
    );
  } catch (error: any) {
    return Error(error);
  }
};

// flash sale stats
export const getFlashSaleStats = async () => {
  try {
    return await fetchWithAuth("/flash-sales/admin/stats");
  } catch (error: any) {
    return Error(error);
  }
};

// manually end expired sales
export const endExpiredFlashSales = async () => {
  try {
    return await fetchWithAuth("/flash-sales/admin/end-expired", {
      method: "POST",
    });
  } catch (error: any) {
    return Error(error);
  }
};
