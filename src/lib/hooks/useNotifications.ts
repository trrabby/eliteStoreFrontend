"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  markRead,
  markAllRead,
  clearToast,
} from "@/store/slices/notificationSlice";
import {
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
  deleteNotification as deleteService,
  clearReadNotifications as clearReadService,
} from "@/services/notification.service";

export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifState = useSelector((s: RootState) => s.notification);

  const markOneRead = async (id: number) => {
    dispatch(markRead(id));
    await markAsReadService(id);
  };

  const markAllRead_ = async () => {
    dispatch(markAllRead());
    await markAllAsReadService();
  };

  const dismissToast = () => {
    dispatch(clearToast());
  };

  return {
    notifications: notifState.items,
    unreadCount: notifState.unreadCount,
    toast: notifState.showToast,
    markOneRead,
    markAllRead: markAllRead_,
    dismissToast,
  };
};
