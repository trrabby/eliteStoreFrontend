/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { buildQuery } from "@/lib/utils/buildQuery";
import { fetchWithAuth, fetchPublic } from "./helpers";

// get all products — public, SSR (no cache — price/stock dynamic)
export const getAllProducts = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  brandId?: number;
  vendorId?: number;
  categoryId?: number;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  tags?: string;
  sortBy?: string;
}) => {
  try {
    return await fetchPublic(`/products${buildQuery(params)}`, {}, 0);
  } catch (error: any) {
    return Error(error);
  }
};

// get product by slug — public, SSR
export const getProductBySlug = async (slug: string) => {
  try {
    return await fetchPublic(`/products/slug/${slug}`, {}, 0);
  } catch (error: any) {
    return Error(error);
  }
};

// get product by id — vendor/admin
export const getProductById = async (id: number) => {
  try {
    return await fetchWithAuth(`/products/${id}`);
  } catch (error: any) {
    return Error(error);
  }
};

// get my products — vendor
export const getMyProducts = async (params: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  try {
    return await fetchWithAuth(`/products/my-products${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

// create product — vendor/admin
export const createProduct = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/products", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// update product — vendor/admin
export const updateProduct = async (id: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/products/${id}`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// delete product
export const deleteProduct = async (id: number) => {
  try {
    return await fetchWithAuth(`/products/${id}`, { method: "DELETE" });
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Images ───────────────────────────────

export const addProductImages = async (id: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/products/${id}/images`, {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const setPrimaryImage = async (productId: number, imageId: number) => {
  try {
    return await fetchWithAuth(
      `/products/${productId}/images/${imageId}/set-primary`,
      { method: "PATCH" },
    );
  } catch (error: any) {
    return Error(error);
  }
};

export const deleteProductImage = async (
  productId: number,
  imageId: number,
) => {
  try {
    return await fetchWithAuth(`/products/${productId}/images/${imageId}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Variants ─────────────────────────────

export const createVariant = async (productId: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/products/${productId}/variants`, {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const updateVariant = async (
  productId: number,
  variantId: number,
  formData: FormData,
) => {
  try {
    return await fetchWithAuth(`/products/${productId}/variants/${variantId}`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const updateStock = async (
  productId: number,
  variantId: number,
  formData: FormData,
) => {
  try {
    return await fetchWithAuth(
      `/products/${productId}/variants/${variantId}/stock`,
      { method: "PATCH", headers: {}, body: formData },
    );
  } catch (error: any) {
    return Error(error);
  }
};

export const deleteVariant = async (productId: number, variantId: number) => {
  try {
    return await fetchWithAuth(`/products/${productId}/variants/${variantId}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Attributes ───────────────────────────

export const addAttribute = async (productId: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/products/${productId}/attributes`, {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const deleteAttribute = async (
  productId: number,
  attributeId: number,
) => {
  try {
    return await fetchWithAuth(
      `/products/${productId}/attributes/${attributeId}`,
      { method: "DELETE" },
    );
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Related Products ─────────────────────

export const addRelatedProducts = async (
  productId: number,
  formData: FormData,
) => {
  try {
    return await fetchWithAuth(`/products/${productId}/related`, {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const removeRelatedProduct = async (
  productId: number,
  relatedId: number,
) => {
  try {
    return await fetchWithAuth(`/products/${productId}/related/${relatedId}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    return Error(error);
  }
};
