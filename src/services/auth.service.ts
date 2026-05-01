/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { config } from "@/config";
import { FieldValues } from "react-hook-form";
import { fetchWithAuth } from "./helpers";

// register
export const registerUser = async (userData: FieldValues) => {
  try {
    const res = await fetch(`${config().Backend_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
      cache: "no-store",
    });
    return res.json();
  } catch (error: any) {
    return Error(error);
  }
};

// login
export const loginUser = async (userData: FieldValues) => {
  try {
    const res = await fetch(`${config().Backend_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
      cache: "no-store",
    });

    const result = await res.json();

    if (result?.success) {
      const cookieStore = await cookies();
      cookieStore.set("accessToken", result.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });
      cookieStore.set("refreshToken", result.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return result;
  } catch (error: any) {
    return Error(error);
  }
};

// oauth — google or github
// providerToken is the token from Google/GitHub
export const loginViaProvider = async (
  providerToken: string,
  provider: "google" | "github",
) => {
  try {
    const route =
      provider === "google" ? "/auth/oauth/google" : "/auth/oauth/github";

    const res = await fetch(`${config().Backend_URL}${route}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: providerToken,
      },
      cache: "no-store",
    });

    const result = await res.json();

    if (result?.success) {
      const cookieStore = await cookies();
      cookieStore.set("accessToken", result.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      cookieStore.set("refreshToken", result.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return result;
  } catch (error: any) {
    return Error(error);
  }
};

// logout
export const logout = async () => {
  try {
    // notify backend to delete session
    await fetchWithAuth("/auth/logout", { method: "POST" });
  } catch {
    // ignore — clear cookies regardless
  } finally {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
  }
  return { success: true };
};

// get current user from decoded JWT (no backend call)
export const getCurrentUser = async () => {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;
    if (!accessToken) return null;
    const decoded = jwtDecode<{
      email: string;
      role: string;
      publicId: string;
    }>(accessToken);
    return decoded;
  } catch {
    return null;
  }
};

// refresh token
export const refreshToken = async () => {
  try {
    const cookieStore = await cookies();
    const refreshTk = cookieStore.get("refreshToken")?.value;
    if (!refreshTk) return { success: false };

    const res = await fetch(`${config().Backend_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: refreshTk,
      },
      cache: "no-store",
    });

    const result = await res.json();

    if (result?.success) {
      cookieStore.set("accessToken", result.data, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    return result;
  } catch (error: any) {
    return Error(error);
  }
};

// forgot password
export const forgotPassword = async (userData: FieldValues) => {
  try {
    const res = await fetch(`${config().Backend_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
      cache: "no-store",
    });
    return res.json();
  } catch (error: any) {
    return Error(error);
  }
};

// reset password
export const resetPassword = async (userData: FieldValues) => {
  try {
    const res = await fetch(`${config().Backend_URL}/auth/reset-pass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
      cache: "no-store",
    });
    return res.json();
  } catch (error: any) {
    return Error(error);
  }
};

// change password (authenticated)
export const changePassword = async (userData: FieldValues) => {
  try {
    return await fetchWithAuth("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  } catch (error: any) {
    return Error(error);
  }
};
