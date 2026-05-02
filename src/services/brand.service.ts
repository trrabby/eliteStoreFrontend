/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { buildQuery } from "@/lib/utils/buildQuery";
import { fetchWithAuth, fetchPublic } from "./helpers";

// get all brands — public
export const getAllBrands = async (params: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  country?: string;
}) => {
  try {
    return await fetchPublic(`/brands${buildQuery(params)}`, {}, 300);
  } catch (error: any) {
    return Error(error);
  }
};

// get featured brands — public, SSG
export const getFeaturedBrands = async () => {
  try {
    return await fetchPublic("/brands/featured", {}, 300);
  } catch (error: any) {
    return Error(error);
  }
};

// get brand by slug — public, SSG
export const getBrandBySlug = async (slug: string) => {
  try {
    return await fetchPublic(`/brands/slug/${slug}`, {}, 300);
  } catch (error: any) {
    return Error(error);
  }
};

// get brand by id — admin
export const getBrandById = async (id: number) => {
  try {
    return await fetchWithAuth(`/brands/${id}`);
  } catch (error: any) {
    return Error(error);
  }
};

// create brand — admin
export const createBrand = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/brands", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// update brand — admin
export const updateBrand = async (id: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/brands/${id}`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// toggle featured — admin
export const toggleBrandFeatured = async (id: number) => {
  try {
    return await fetchWithAuth(`/brands/${id}/toggle-featured`, {
      method: "PATCH",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// delete brand — admin
export const deleteBrand = async (id: number) => {
  try {
    return await fetchWithAuth(`/brands/${id}`, { method: "DELETE" });
  } catch (error: any) {
    return Error(error);
  }
};
