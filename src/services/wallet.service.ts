/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { fetchWithAuth, buildQuery } from "./helpers";

// get my wallet
export const getWallet = async () => {
  try {
    return await fetchWithAuth("/wallet");
  } catch (error: any) {
    return Error(error);
  }
};

// get transaction history
export const getTransactionHistory = async (params: {
  page?: number;
  limit?: number;
  type?: string;
  reason?: string;
}) => {
  try {
    return await fetchWithAuth(`/wallet/transactions${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

// initiate add money — SSL or bKash
export const initiateAddMoney = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/wallet/add-money", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// transfer to another user wallet
export const transferToWallet = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/wallet/transfer", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Admin ────────────────────────────────

export const getWalletStats = async () => {
  try {
    return await fetchWithAuth("/wallet/stats");
  } catch (error: any) {
    return Error(error);
  }
};

export const getAllWallets = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  try {
    return await fetchWithAuth(`/wallet/all${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

export const adminCreditWallet = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/wallet/admin-credit", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};
