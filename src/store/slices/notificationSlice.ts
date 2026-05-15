import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "..";

export type NotificationType =
  | "ORDER_UPDATE"
  | "PAYMENT"
  | "PROMOTION"
  | "REVIEW"
  | "RESTOCK"
  | "SYSTEM";

export interface INotification {
  id: number;

  type: NotificationType;

  title: string;

  body: string;

  link?: string | null;

  isRead: boolean;

  createdAt: string;
}

interface NotificationState {
  items: INotification[];

  unreadCount: number;

  showToast: INotification | null;
}

const initialState: NotificationState = {
  items: [],

  unreadCount: 0,

  showToast: null,
};

export const notificationSlice = createSlice({
  name: "notification",

  initialState,

  reducers: {
    setNotifications: (
      state,
      action: PayloadAction<{
        notifications: INotification[];

        unreadCount: number;
      }>,
    ) => {
      state.items = action.payload.notifications;

      state.unreadCount = action.payload.unreadCount;
    },

    pushNotification: (state, action: PayloadAction<INotification>) => {
      state.items.unshift(action.payload);

      state.unreadCount += 1;

      state.showToast = action.payload;
    },

    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },

    markSingleRead: (state, action: PayloadAction<number>) => {
      const notification = state.items.find(
        (item) => item.id === action.payload,
      );

      if (notification && !notification.isRead) {
        notification.isRead = true;

        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllRead: (state) => {
      state.items.forEach((notification) => {
        notification.isRead = true;
      });

      state.unreadCount = 0;
    },

    removeNotification: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    clearToast: (state) => {
      state.showToast = null;
    },

    resetNotifications: (state) => {
      state.items = [];

      state.unreadCount = 0;

      state.showToast = null;
    },
  },
});

export const {
  setNotifications,
  pushNotification,
  setUnreadCount,
  markSingleRead,
  markAllRead,
  removeNotification,
  clearToast,
  resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;

// selectors

export const selectNotifications = (state: RootState) =>
  state.notification.items;

export const selectUnreadCount = (state: RootState) =>
  state.notification.unreadCount;

export const selectNotificationToast = (state: RootState) =>
  state.notification.showToast;
