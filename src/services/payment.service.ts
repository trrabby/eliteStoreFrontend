/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { fetchWithAuth, buildQuery } from "./helpers";

// initiate payment
export const initiatePayment = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/payments/initiate", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// get payment by order id
export const getPaymentByOrderId = async (orderId: number) => {
  try {
    return await fetchWithAuth(`/payments/order/${orderId}`);
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Admin ────────────────────────────────

export const getAllPayments = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
}) => {
  try {
    return await fetchWithAuth(`/payments${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

export const initiateRefund = async (orderId: number) => {
  try {
    return await fetchWithAuth(`/payments/refund/${orderId}`, {
      method: "POST",
    });
  } catch (error: any) {
    return Error(error);
  }
};
