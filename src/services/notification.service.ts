/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { fetchWithAuth, fetchPublic, buildQuery } from "./helpers";

// get VAPID public key — public
export const getVapidPublicKey = async () => {
  try {
    return await fetchPublic("/notifications/vapid-key", {}, 86400); // 24hr cache
  } catch (error: any) {
    return Error(error);
  }
};

// get my notifications
export const getMyNotifications = async (params: {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}) => {
  try {
    return await fetchWithAuth(`/notifications${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

// get unread count
export const getUnreadCount = async () => {
  try {
    return await fetchWithAuth("/notifications/unread-count");
  } catch (error: any) {
    return Error(error);
  }
};

// mark single as read
export const markAsRead = async (id: number) => {
  try {
    return await fetchWithAuth(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// mark all as read
export const markAllAsRead = async () => {
  try {
    return await fetchWithAuth("/notifications/mark-all-read", {
      method: "PATCH",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// delete notification
export const deleteNotification = async (id: number) => {
  try {
    return await fetchWithAuth(`/notifications/${id}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// clear read notifications
export const clearReadNotifications = async () => {
  try {
    return await fetchWithAuth("/notifications/clear-read", {
      method: "DELETE",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// save push subscription
export const savePushSubscription = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/notifications/push/subscribe", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// remove push subscription
export const removePushSubscription = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/notifications/push/unsubscribe", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Admin ────────────────────────────────

export const getNotificationStats = async () => {
  try {
    return await fetchWithAuth("/notifications/stats");
  } catch (error: any) {
    return Error(error);
  }
};

export const sendBulkNotification = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/notifications/bulk", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};
