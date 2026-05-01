import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Notification = {
  id: number;
  type: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

type NotificationState = {
  items: Notification[];
  unreadCount: number;
  showToast: Notification | null;
};

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
      action: PayloadAction<{ items: Notification[]; unreadCount: number }>,
    ) => {
      state.items = action.payload.items;
      state.unreadCount = action.payload.unreadCount;
    },
    pushNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
      state.showToast = action.payload;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    markRead: (state, action: PayloadAction<number>) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead: (state) => {
      state.items.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
    },
    clearToast: (state) => {
      state.showToast = null;
    },
  },
});

export const {
  setNotifications,
  pushNotification,
  setUnreadCount,
  markRead,
  markAllRead,
  clearToast,
} = notificationSlice.actions;
