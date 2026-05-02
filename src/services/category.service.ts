/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { buildQuery } from "@/lib/utils/buildQuery";
import { fetchWithAuth, fetchPublic } from "./helpers";

// get full category tree — public, SSG (revalidate 10min)
export const getCategoryTree = async () => {
  try {
    return await fetchPublic("/categories/tree", {}, 600);
  } catch (error: any) {
    return Error(error);
  }
};

// get category by slug — public, SSG
export const getCategoryBySlug = async (slug: string) => {
  try {
    return await fetchPublic(`/categories/slug/${slug}`, {}, 600);
  } catch (error: any) {
    return Error(error);
  }
};

// get all categories — admin, flat list
export const getAllCategories = async (params: {
  page?: number;
  limit?: number;
  depth?: number;
  isActive?: boolean;
  search?: string;
  parentId?: number;
}) => {
  try {
    return await fetchWithAuth(`/categories${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

// get category by id — admin
export const getCategoryById = async (id: number) => {
  try {
    return await fetchWithAuth(`/categories/${id}`);
  } catch (error: any) {
    return Error(error);
  }
};

// create category — admin
export const createCategory = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/categories", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// update category — admin
export const updateCategory = async (id: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/categories/${id}`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// delete category — admin
export const deleteCategory = async (id: number) => {
  try {
    return await fetchWithAuth(`/categories/${id}`, { method: "DELETE" });
  } catch (error: any) {
    return Error(error);
  }
};
