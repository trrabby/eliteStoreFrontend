"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  markSingleRead,
  markAllRead,
  clearToast,
  setNotifications,
  pushNotification,
  removeNotification,
  setUnreadCount,
  resetNotifications,
} from "@/store/slices/notificationSlice";
import {
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
  deleteNotification as deleteService,
  clearReadNotifications as clearReadService,
  getMyNotifications as getNotificationsService,
} from "@/services/notification.service";
import { toast } from "sonner";

export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notificationState = useSelector((s: RootState) => s.notification);

  // Fetch notifications from server
  const fetchNotifications = async () => {
    try {
      const response = await getNotificationsService({});

      if (response?.success && response.data) {
        dispatch(
          setNotifications({
            notifications: response.data.notifications || response.data,
            unreadCount: response.data.unreadCount || 0,
          }),
        );
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return null;
    }
  };

  // Mark a single notification as read
  const markOneRead = async (id: number) => {
    // Optimistic update
    dispatch(markSingleRead(id));

    try {
      const result = await markAsReadService(id);

      if (!result?.success) {
        // Rollback - need to refetch to get correct state
        await fetchNotifications();
        toast.error(result?.message ?? "Failed to mark as read");
        return false;
      }

      return true;
    } catch (error) {
      // Rollback on error
      await fetchNotifications();
      toast.error("Failed to mark as read");
      return false;
    }
  };

  // Mark all notifications as read
  const markAllRead_ = async () => {
    // Optimistic update
    dispatch(markAllRead());

    try {
      const result = await markAllAsReadService();

      if (!result?.success) {
        // Rollback on failure
        await fetchNotifications();
        toast.error(result?.message ?? "Failed to mark all as read");
        return false;
      }

      toast.success("All notifications marked as read");
      return true;
    } catch (error) {
      // Rollback on error
      await fetchNotifications();
      toast.error("Failed to mark all as read");
      return false;
    }
  };

  // Delete a notification
  const deleteNotification = async (id: number) => {
    // Store the deleted notification for potential rollback
    const deletedNotification = notificationState.items.find(
      (item) => item.id === id,
    );

    // Optimistic update
    dispatch(removeNotification(id));

    try {
      const result = await deleteService(id);

      if (!result?.success) {
        // Rollback on failure
        if (deletedNotification) {
          dispatch(pushNotification(deletedNotification));
        }
        toast.error(result?.message ?? "Failed to delete notification");
        return false;
      }

      toast.success("Notification deleted");
      return true;
    } catch (error) {
      // Rollback on error
      if (deletedNotification) {
        dispatch(pushNotification(deletedNotification));
      }
      toast.error("Failed to delete notification");
      return false;
    }
  };

  // Clear all read notifications
  const clearReadNotifications = async () => {
    // Store current items for rollback
    const currentItems = [...notificationState.items];
    const currentUnreadCount = notificationState.unreadCount;

    // Optimistic update - remove only read notifications
    const unreadNotifications = notificationState.items.filter(
      (item) => !item.isRead,
    );
    dispatch(
      setNotifications({
        notifications: unreadNotifications,
        unreadCount: currentUnreadCount,
      }),
    );

    try {
      const result = await clearReadService();

      if (!result?.success) {
        // Rollback on failure
        dispatch(
          setNotifications({
            notifications: currentItems,
            unreadCount: currentUnreadCount,
          }),
        );
        toast.error(result?.message ?? "Failed to clear read notifications");
        return false;
      }

      toast.success("Read notifications cleared");
      return true;
    } catch (error) {
      // Rollback on error
      dispatch(
        setNotifications({
          notifications: currentItems,
          unreadCount: currentUnreadCount,
        }),
      );
      toast.error("Failed to clear read notifications");
      return false;
    }
  };

  // Dismiss toast notification
  const dismissToast = () => {
    dispatch(clearToast());
  };

  // Reset all notifications (e.g., on logout)
  const resetAllNotifications = () => {
    dispatch(resetNotifications());
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notificationState.items.filter((item) => !item.isRead);
  };

  // Get notifications by type
  const getNotificationsByType = (type: string) => {
    return notificationState.items.filter((item) => item.type === type);
  };

  return {
    // State
    notifications: notificationState.items,
    unreadCount: notificationState.unreadCount,
    toast: notificationState.showToast,

    // Computed values
    hasUnread: notificationState.unreadCount > 0,
    hasNotifications: notificationState.items.length > 0,

    // Actions
    fetchNotifications,
    markOneRead,
    markAllRead: markAllRead_,
    deleteNotification,
    clearReadNotifications,
    dismissToast,
    resetAllNotifications,

    // Helpers
    getUnreadNotifications,
    getNotificationsByType,
  };
};
