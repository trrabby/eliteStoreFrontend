/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { config } from "@/config";
import { cookies } from "next/headers";

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
    credentials: "include",
  });
  // console.log({ res });
  // ─────────────────────────────────────────
  // HANDLE 401
  // ─────────────────────────────────────────
  if (res.status === 401) {
    let errorData: any = null;

    try {
      errorData = await res.clone().json();
    } catch {
      errorData = null;
    }

    const errorCode = errorData?.code;
    // console.log(errorCode);
    // ─────────────────────────────
    // TOKEN EXPIRED → REFRESH FLOW
    // ─────────────────────────────
    if (errorCode === "TOKEN_EXPIRED") {
      const refreshToken = cookieStore.get("refreshToken")?.value;
      // console.log({ refreshToken });

      if (!refreshToken) {
        console.log("noToken");
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");

        return {
          success: false,
          message: "Session expired",
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

      if (process.env.NODE_ENV === "development") {
        console.log("REFRESH SUCCESS =>", refreshData?.success);
      }

      if (!refreshData?.success) {
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");

        return {
          success: false,
          message: "Session expired",
        };
      }

      const newAccessToken = refreshData.data;

      console.log("reissusing access token");
      cookieStore.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      // retry request
      res = await fetch(`${config().Backend_URL}${url}`, {
        ...options,
        headers: {
          ...headers,
          Authorization: newAccessToken,
        },
        cache: "no-store",
      });
    }

    // ─────────────────────────────
    // INVALID TOKEN → HARD FAIL
    // ─────────────────────────────
    else {
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");

      return {
        success: false,
        message: "Unauthorized access",
      };
    }
  }

  const data = await res.json();
  // console.log(data);
  // safety guard
  if (!accessToken) {
    return {
      success: false,
      message: "Please log in again",
    };
  }

  if (process.env.NODE_ENV === "development") {
    console.log("API RESPONSE =>", {
      url,
      success: data?.success,
    });
  }

  return data;
};

// export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
//   const isFormData = options.body instanceof FormData;

//   const headers: Record<string, string> = {
//     ...(!isFormData && { "Content-Type": "application/json" }),
//     ...(options.headers as Record<string, string>),
//   };

//   // FIRST REQUEST
//   let res = await fetch(`${config().Backend_URL}${url}`, {
//     ...options,
//     headers,
//     credentials: "include", // CRITICAL
//     cache: "no-store",
//   });

//   // ─────────────────────────────
//   // REFRESH FLOW (COOKIE BASED)
//   // ─────────────────────────────
//   if (res.status === 401) {
//     let errorData: any = null;

//     try {
//       errorData = await res.clone().json();
//     } catch {}

//     const isExpired = errorData?.code === "TOKEN_EXPIRED";

//     if (isExpired) {
//       // refresh call (cookies automatically sent)
//       const refreshRes = await fetch(
//         `${config().Backend_URL}/auth/refresh-token`,
//         {
//           method: "POST",
//           credentials: "include",
//         },
//       );

//       const refreshData = await refreshRes.json();

//       if (!refreshData?.success) {
//         return {
//           success: false,
//           message: "Session expired",
//         };
//       }

//       // retry original request
//       res = await fetch(`${config().Backend_URL}${url}`, {
//         ...options,
//         headers,
//         credentials: "include",
//         cache: "no-store",
//       });
//     } else {
//       return {
//         success: false,
//         message: "Unauthorized access",
//       };
//     }
//   }

//   return res.json();
// };

// ─────────────────────────────────────────
// Public fetch — no auth
// ─────────────────────────────────────────

export const fetchPublic = async (
  url: string,
  options: RequestInit = {},
  revalidate?: number,
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
