"use server";

import { buildQuery } from "@/lib/utils/buildQuery";

import { fetchWithAuth } from "./helpers";

import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

import type {
  IUser,
  IAddress,
  RegisterPayload,
  IUserResponse,
} from "@/types/user.types";

// ======================================
// REGISTER
// ======================================

export const registerUser = async (
  userData: RegisterPayload,
): Promise<ApiResponse<IUser>> => {
  const formData = new FormData();

  Object.entries(userData).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/register`,
    {
      method: "POST",

      body: formData,

      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Registration failed");
  }

  return res.json();
};

// ======================================
// MY PROFILE
// ======================================

export const getMyProfile = async (): Promise<ApiResponse<IUserResponse>> => {
  return fetchWithAuth("/users/my-profile");
};

export const updateMyProfile = async (
  formData: FormData,
): Promise<ApiResponse<IUser>> => {
  return fetchWithAuth("/users/my-profile", {
    method: "PATCH",

    headers: {},

    body: formData,
  });
};

export const deleteMyProfile = async (
  publicId: string,
): Promise<ApiResponse<null>> => {
  return fetchWithAuth(`/users/delete-profile/${publicId}`, {
    method: "PATCH",
  });
};

// ======================================
// USERS (ADMIN)
// ======================================

interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

export const getAllUsers = async (
  params: GetUsersParams,
): Promise<PaginatedResponse<IUser>> => {
  return fetchWithAuth(`/users${buildQuery(params)}`);
};

export const getUserByEmail = async (
  email: string,
): Promise<ApiResponse<IUser>> => {
  return fetchWithAuth(`/users/by-email/${email}`);
};

export const makeAdmin = async (
  publicId: string,
): Promise<ApiResponse<IUser>> => {
  return fetchWithAuth(`/users/make-admin/${publicId}`, {
    method: "PATCH",
  });
};

// ======================================
// ADDRESSES
// ======================================

export const addAddress = async (
  formData: FormData,
): Promise<ApiResponse<IAddress>> => {
  return fetchWithAuth("/users/add-addresses", {
    method: "POST",

    headers: {},

    body: formData,
  });
};

export const getMyAddresses = async (): Promise<ApiResponse<IAddress[]>> => {
  return fetchWithAuth("/users/addresses");
};

export const getSingleAddress = async (
  addressId: number,
): Promise<ApiResponse<IAddress>> => {
  return fetchWithAuth(`/users/addresses/${addressId}`);
};

export const updateAddress = async (
  addressId: number,
  formData: FormData,
): Promise<ApiResponse<IAddress>> => {
  return fetchWithAuth(`/users/addresses/${addressId}`, {
    method: "PATCH",

    headers: {},

    body: formData,
  });
};

export const setDefaultAddress = async (
  addressId: number,
): Promise<ApiResponse<IAddress>> => {
  return fetchWithAuth(`/users/addresses/${addressId}/set-default`, {
    method: "PATCH",
  });
};

export const deleteAddress = async (
  addressId: number,
): Promise<ApiResponse<null>> => {
  return fetchWithAuth(`/users/addresses/${addressId}`, {
    method: "DELETE",
  });
};
