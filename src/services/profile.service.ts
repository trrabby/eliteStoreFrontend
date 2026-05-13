"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { config } from "@/config";

type JWTPayload = {
  email: string;
  role: string;
  publicId: string;
};

// Called from server layout — decodes JWT then fetches full profile
// Returns { user, accessToken } or null
export const getServerSideUser = async () => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) return null;

    // decode JWT to get publicId / email / role
    const decoded = jwtDecode<JWTPayload>(accessToken);

    if (!decoded?.email) return null;

    // fetch full profile from backend
    const res = await fetch(`${config().Backend_URL}/auth/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const result = await res.json();
    if (!result?.success || !result?.data) return null;

    const data = result.data;

    return {
      accessToken,
      user: {
        publicId: decoded.publicId,
        email: data.email,
        role: data.role,
        firstName: data.accountInfo?.firstName ?? "",
        lastName: data.accountInfo?.lastName ?? "",
        avatar: data.accountInfo?.avatar ?? null,
        phone: data.phone ?? null,
        isEmailVerified: data.isEmailVerified ?? false,
      },
    };
  } catch {
    return null;
  }
};
