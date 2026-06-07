/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { buildQuery } from "@/lib/utils/buildQuery";

import { fetchWithAuth } from "./helpers";

import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

import type { IUser, IAddress, IUserResponse } from "@/types/user.types";
import { config } from "@/config";
import { cookies } from "next/headers";

// ======================================
// REGISTER
// ======================================

export const registerUser = async (
  userData: FormData,
): Promise<ApiResponse<IUser>> => {
  try {
    const res = await fetch(`${config().Backend_URL}/users/register`, {
      method: "POST",
      headers: {},
      body: userData,
      cache: "no-store",
    });

    const result = await res.json();
    console.log(result);

    if (result?.success) {
      const cookieStore = await cookies();
      cookieStore.set("accessToken", result.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      cookieStore.set("refreshToken", result.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      data: null as any,
      message: error?.message || "Registration failed",
    };
  }
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
): Promise<PaginatedResponse<any>> => {
  return fetchWithAuth(`/users${buildQuery(params)}`);
};

export const getUserByEmail = async (
  email: string,
): Promise<ApiResponse<IUser>> => {
  const res = await fetch(`${config().Backend_URL}/users/by-email/${email}`);
  // console.log("getUserByEmail response:", res);
  return res.json();
};

export const makeAdmin = async (
  publicId: string,
): Promise<ApiResponse<IUser>> => {
  return fetchWithAuth(`/users/make-admin/${publicId}`, {
    method: "PATCH",
  });
};

export const toggleUserStatus = async (id: number) => {
  try {
    return await fetchWithAuth(`/users/toggle-status/${id}`, {
      method: "PATCH",
    });
  } catch (e: any) {
    return Error(e);
  }
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
