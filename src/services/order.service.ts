/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { buildQuery } from "@/lib/utils/buildQuery";
import { fetchWithAuth } from "./helpers";

// place order from cart
export const createOrder = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/orders", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// my orders — customer
export const getMyOrders = async (params: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  try {
    return await fetchWithAuth(`/orders/my-orders${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

// my single order by id
export const getMyOrderById = async (id: number) => {
  try {
    return await fetchWithAuth(`/orders/my-orders/${id}`);
  } catch (error: any) {
    return Error(error);
  }
};

// track order by order number — customer
export const trackOrder = async (orderNumber: string) => {
  try {
    return await fetchWithAuth(`/orders/my-orders/track/${orderNumber}`);
  } catch (error: any) {
    return Error(error);
  }
};

// cancel order — customer
export const cancelOrder = async (id: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/orders/my-orders/${id}/cancel`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Admin ────────────────────────────────

export const getAllOrders = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  userId?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  try {
    return await fetchWithAuth(`/orders${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

export const getOrderByIdAdmin = async (id: number) => {
  try {
    return await fetchWithAuth(`/orders/${id}`);
  } catch (error: any) {
    return Error(error);
  }
};

export const updateOrderStatus = async (id: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/orders/${id}/status`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const getOrderStats = async () => {
  try {
    return await fetchWithAuth("/orders/stats");
  } catch (error: any) {
    return Error(error);
  }
};
