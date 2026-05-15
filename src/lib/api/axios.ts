/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { store } from "@/store";
import { setLogout } from "@/store/slices/authSlice";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important: sends cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// No need to manually attach token since cookies are sent automatically with withCredentials: true
axiosInstance.interceptors.request.use((config) => {
  // You can add any client-side headers here if needed
  return config;
});

// Handle token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry refresh token endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh token endpoint (cookies are sent automatically)
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const result = response.data;

        if (result?.success) {
          // Token is automatically set in cookies by the server
          // No need to manually update Redux
          processQueue(null, null);
          return axiosInstance(originalRequest);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (err) {
        processQueue(err, null);
        // Clear user data on refresh failure
        store.dispatch(setLogout());

        // Redirect to login page
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
