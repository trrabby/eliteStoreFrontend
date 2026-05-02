/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { config } from "@/config";

// ─────────────────────────────────────────
// Core fetch wrapper with auto token refresh
// ─────────────────────────────────────────

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
): Promise<any> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const headers = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
    ...(accessToken ? { Authorization: accessToken } : {}),
  };

  const res = await fetch(`${config().Backend_URL}${url}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  // 401 → try refresh
  if (res.status === 401) {
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) return { success: false, message: "Unauthorized" };

    const refreshRes = await fetch(
      `${config().Backend_URL}/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: refreshToken,
        },
        cache: "no-store",
      },
    );

    const refreshData = await refreshRes.json();

    if (!refreshData?.success) {
      // refresh also failed — clear cookies
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      return {
        success: false,
        message: "Session expired. Please login again.",
      };
    }

    // save new access token
    const newAccessToken = refreshData.data;
    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    // retry original request with new token
    const retryRes = await fetch(`${config().Backend_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) ?? {}),
        Authorization: newAccessToken,
      },
      cache: "no-store",
    });

    return retryRes.json();
  }

  return res.json();
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

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

export const buildQuery = async (
  params: Record<string, any>,
): Promise<string> => {
  const filtered = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return filtered.length ? `?${filtered.join("&")}` : "";
};
