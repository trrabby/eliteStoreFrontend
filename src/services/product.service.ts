/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { buildQuery } from "@/lib/utils/buildQuery";
import { fetchWithAuth, fetchPublic } from "./helpers";

// get all products — public, SSR (no cache — price/stock dynamic)
export const getAllProducts = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  brandIds?: number[];
  vendorId?: number;
  categoryIds?: number[];
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  tags?: string;
  sortBy?: string;
  minRating?: number;
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

// Public product fetch by id — no auth required
export const getProductByIdPublic = async (id: number) => {
  try {
    return await fetchPublic(`/products/id/${id}`, {}, 60);
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
    return await fetchWithAuth("/products/create", {
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
    return await fetchWithAuth(`/products/update/${id}`, {
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
    return await fetchWithAuth(`/products/delete/${id}`, { method: "DELETE" });
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Images ───────────────────────────────

export const addProductImages = async (id: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/products/addProductImages/${id}`, {
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
      `/products/update/${productId}/images/${imageId}/set-primary`,
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
    return await fetchWithAuth(
      `/products/delete/${productId}/images/${imageId}`,
      {
        method: "DELETE",
      },
    );
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

export const getProductVariants = async (productId: number) => {
  try {
    return await fetchWithAuth(`/products/${productId}/variants`);
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
    console.log(error);
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

export const getProductAttributes = async (productId: number) => {
  try {
    return await fetchWithAuth(`/products/${productId}/attributes`);
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

export const getProductRelated = async (productId: number) => {
  try {
    return await fetchWithAuth(`/products/${productId}/related`);
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
