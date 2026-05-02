/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { buildQuery } from "@/lib/utils/buildQuery";
import { fetchWithAuth, fetchPublic } from "./helpers";

// create vendor profile
export const createVendorProfile = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/vendors/create-vendor", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// get all vendors — public + paginated
export const getAllVendors = async (params: {
  page?: number;
  limit?: number;
  isVerified?: boolean;
  search?: string;
}) => {
  try {
    // SSG+ISR — revalidate every 5 min
    return await fetchPublic(`/vendors${buildQuery(params)}`, {}, 300);
  } catch (error: any) {
    return Error(error);
  }
};

// get vendor by slug — public
export const getVendorBySlug = async (slug: string) => {
  try {
    return await fetchPublic(`/vendors/${slug}`, {}, 300);
  } catch (error: any) {
    return Error(error);
  }
};

// get my vendor profile — authenticated
export const getMyVendorProfile = async () => {
  try {
    return await fetchWithAuth("/vendors/my/profile");
  } catch (error: any) {
    return Error(error);
  }
};

// update vendor profile
export const updateVendorProfile = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/vendors/my/profile", {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// verify vendor — admin
export const verifyVendor = async (publicId: string) => {
  try {
    return await fetchWithAuth(`/vendors/${publicId}/verify`, {
      method: "PATCH",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// deactivate vendor — admin
export const deactivateVendor = async (publicId: string) => {
  try {
    return await fetchWithAuth(`/vendors/${publicId}/deactivate`, {
      method: "PATCH",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// delete vendor profile
export const deleteVendorProfile = async () => {
  try {
    return await fetchWithAuth("/vendors/my/profile", { method: "DELETE" });
  } catch (error: any) {
    return Error(error);
  }
};
