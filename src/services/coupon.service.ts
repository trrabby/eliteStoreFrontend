/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { buildQuery } from "@/lib/utils/buildQuery";
import { fetchWithAuth } from "./helpers";

// apply coupon — validate before order
export const applyCoupon = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/coupons/apply", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// my coupon usage history
export const getMyCouponHistory = async () => {
  try {
    return await fetchWithAuth("/coupons/my-history");
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Admin ────────────────────────────────

export const getAllCoupons = async (params: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
  isExpired?: boolean;
}) => {
  try {
    return await fetchWithAuth(`/coupons${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

export const getCouponById = async (id: number) => {
  try {
    return await fetchWithAuth(`/coupons/${id}`);
  } catch (error: any) {
    return Error(error);
  }
};

export const createCoupon = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/coupons", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const updateCoupon = async (id: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/coupons/${id}`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const toggleCouponStatus = async (id: number) => {
  try {
    return await fetchWithAuth(`/coupons/${id}/toggle-status`, {
      method: "PATCH",
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const deleteCoupon = async (id: number) => {
  try {
    return await fetchWithAuth(`/coupons/${id}`, { method: "DELETE" });
  } catch (error: any) {
    return Error(error);
  }
};
