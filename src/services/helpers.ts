/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { config } from "@/config";
import { redirect } from "next/navigation";

// ─────────────────────────────────────────
// Core fetch wrapper with auto token refresh
// ─────────────────────────────────────────

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData && {
      "Content-Type": "application/json",
    }),
    ...((options.headers as Record<string, string>) ?? {}),
    ...(accessToken && {
      Authorization: accessToken,
    }),
  };

  let res = await fetch(`${config().Backend_URL}${url}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (res.status === 401) {
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const refreshRes = await fetch(
      `${config().Backend_URL}/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          Authorization: refreshToken,
        },
      },
    );

    const refreshData = await refreshRes.json();

    if (!refreshData?.success) {
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");

      return {
        success: false,
        message: "Session expired",
      };
    }

    const newAccessToken = refreshData.data;

    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    res = await fetch(`${config().Backend_URL}${url}`, {
      ...options,
      headers: {
        ...headers,
        Authorization: `Bearer ${newAccessToken}`,
      },
      cache: "no-store",
    });
  }

  const data = await res.json();
  if (!accessToken) {
    return {
      success: false,
      message: "Please log in again, something went wrong",
    };
  }
  return data;
};

// ─────────────────────────────────────────
// Public fetch — no auth, supports Next.js
// cache/revalidation options
// ─────────────────────────────────────────

export const fetchPublic = async (
  url: string,
  options: RequestInit = {},
  revalidate?: number, // seconds — undefined = no cache
): Promise<any> => {
  const res = await fetch(`${config().Backend_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) ?? {}),
    },
    next: revalidate !== undefined ? { revalidate } : { revalidate: 0 },
  });

  return res.json();
};
