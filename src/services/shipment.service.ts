/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { fetchWithAuth, fetchPublic, buildQuery } from "./helpers";

// track by tracking number — public
export const trackByTrackingNumber = async (trackingNumber: string) => {
  try {
    return await fetchPublic(
      `/shipments/track/${trackingNumber}`,
      {},
      0, // no cache — live tracking
    );
  } catch (error: any) {
    return Error(error);
  }
};

// get shipment for an order — customer/admin
export const getShipmentByOrderId = async (orderId: number) => {
  try {
    return await fetchWithAuth(`/shipments/order/${orderId}`);
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Admin ────────────────────────────────

export const getShipmentStats = async () => {
  try {
    return await fetchWithAuth("/shipments/stats");
  } catch (error: any) {
    return Error(error);
  }
};

export const getAllShipments = async (params: {
  page?: number;
  limit?: number;
  carrier?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  try {
    return await fetchWithAuth(`/shipments${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

export const createShipment = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/shipments", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const updateShipment = async (id: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/shipments/${id}`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// bulk mark out for delivery
export const markOutForDelivery = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/shipments/bulk/out-for-delivery", {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// bulk mark delivered
export const markDelivered = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/shipments/bulk/delivered", {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Steadfast ────────────────────────────

export const createSteadfastShipments = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/shipments/steadfast/bulk-create", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const syncSteadfastStatuses = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/shipments/steadfast/sync-status", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const getSteadfastBalance = async () => {
  try {
    return await fetchWithAuth("/shipments/steadfast/balance");
  } catch (error: any) {
    return Error(error);
  }
};
