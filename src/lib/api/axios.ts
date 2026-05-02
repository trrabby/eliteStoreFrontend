/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { store } from "@/store";
import { clearCredentials, setCredentials } from "@/store/slices/authSlice";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// attach token
axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// refresh token on 401
let isRefreshing = false;
let failedQueue: any[] = [];

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const newToken = data.data.accessToken;

        store.dispatch(
          setCredentials({
            user: store.getState().auth.user!,
            accessToken: newToken,
          }),
        );

        processQueue(null, newToken);
        originalRequest.headers.Authorization = newToken;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        store.dispatch(clearCredentials());
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
