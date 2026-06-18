/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { buildQuery } from "@/lib/utils/buildQuery";
import { fetchWithAuth } from "./helpers";

// Vendor
export const createWithdrawRequest = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/vendor-withdrawals", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (e: any) {
    return Error(e);
  }
};

export const getMyWithdrawRequests = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  try {
    return await fetchWithAuth(
      `/vendor-withdrawals/my/requests${buildQuery(params)}`,
    );
  } catch (e: any) {
    return Error(e);
  }
};

export const cancelMyWithdrawRequest = async (publicId: string) => {
  try {
    return await fetchWithAuth(`/vendor-withdrawals/my/cancel/${publicId}`, {
      method: "PATCH",
    });
  } catch (e: any) {
    return Error(e);
  }
};

// Admin | Vendor
export const getSingleWithdrawRequest = async (id: number) => {
  return await fetchWithAuth(`/vendor-withdrawals/my/request/${id}`);
};

// Admin
export const getAllWithdrawRequests = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  try {
    return await fetchWithAuth(`/vendor-withdrawals${buildQuery(params)}`);
  } catch (e: any) {
    return Error(e);
  }
};

export const updateWithdrawRequestStatus = async (
  publicId: string,
  formData: FormData,
) => {
  try {
    return await fetchWithAuth(`/vendor-withdrawals/${publicId}/status`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (e: any) {
    return Error(e);
  }
};
