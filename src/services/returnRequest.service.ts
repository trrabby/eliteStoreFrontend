/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { fetchWithAuth, buildQuery } from "./helpers";

// submit return request — customer
export const createReturnRequest = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/returns", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// my return requests — customer
export const getMyReturnRequests = async (params: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  try {
    return await fetchWithAuth(`/returns/my-requests${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

// single return request
export const getReturnRequestById = async (id: number) => {
  try {
    return await fetchWithAuth(`/returns/${id}`);
  } catch (error: any) {
    return Error(error);
  }
};

// cancel return request — customer
export const cancelReturnRequest = async (id: number) => {
  try {
    return await fetchWithAuth(`/returns/${id}/cancel`, {
      method: "PATCH",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Admin ────────────────────────────────

export const getReturnStats = async () => {
  try {
    return await fetchWithAuth("/returns/stats/overview");
  } catch (error: any) {
    return Error(error);
  }
};

export const getAllReturnRequests = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  reason?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  try {
    return await fetchWithAuth(`/returns${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

// approve or reject return — triggers all cascades
export const processReturn = async (id: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/returns/${id}/process`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// manual status update — admin
export const updateReturnStatus = async (id: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/returns/${id}/status`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};
