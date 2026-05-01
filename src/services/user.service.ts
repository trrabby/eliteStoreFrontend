/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { fetchWithAuth, buildQuery } from "./helpers";

// get my profile
export const getMyProfile = async () => {
  try {
    return await fetchWithAuth("/auth/me");
  } catch (error: any) {
    return Error(error);
  }
};

// update my profile
export const updateMyProfile = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/users/my-profile", {
      method: "PATCH",
      headers: {}, // let fetch set multipart boundary
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// get all users — admin
export const getAllUsers = async (params: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}) => {
  try {
    return await fetchWithAuth(`/users${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

// get user by email — admin
export const getUserByEmail = async (email: string) => {
  try {
    return await fetchWithAuth(`/users/by-email/${email}`);
  } catch (error: any) {
    return Error(error);
  }
};

// get user profile by publicId
export const getUserProfile = async (publicId: string) => {
  try {
    return await fetchWithAuth(`/users/profile/${publicId}`);
  } catch (error: any) {
    return Error(error);
  }
};

// make admin — super admin only
export const makeAdmin = async (publicId: string) => {
  try {
    return await fetchWithAuth(`/users/make-admin/${publicId}`, {
      method: "PATCH",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// delete my profile
export const deleteMyProfile = async () => {
  try {
    return await fetchWithAuth("/users/my-profile", { method: "DELETE" });
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Addresses ────────────────────────────

export const getMyAddresses = async () => {
  try {
    return await fetchWithAuth("/users/addresses");
  } catch (error: any) {
    return Error(error);
  }
};

export const getSingleAddress = async (addressId: number) => {
  try {
    return await fetchWithAuth(`/users/addresses/${addressId}`);
  } catch (error: any) {
    return Error(error);
  }
};

export const addAddress = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/users/addresses", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const updateAddress = async (addressId: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/users/addresses/${addressId}`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const setDefaultAddress = async (addressId: number) => {
  try {
    return await fetchWithAuth(`/users/addresses/${addressId}/set-default`, {
      method: "PATCH",
    });
  } catch (error: any) {
    return Error(error);
  }
};

export const deleteAddress = async (addressId: number) => {
  try {
    return await fetchWithAuth(`/users/addresses/${addressId}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    return Error(error);
  }
};
