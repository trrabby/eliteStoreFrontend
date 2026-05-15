import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER" | "VENDOR";

export interface IAccountInfo {
  firstName: string;
  lastName: string;
  displayName: string | null;
  avatar: string | null;
}

export interface IAddress {
  id: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city_district: string;
  postalCode: string;
  country: string;
  landmark: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface IUser {
  id: number;
  publicId: string;

  email: string;
  phone: string;

  role: UserRole;

  isEmailVerified: boolean;
  isPhoneVerified: boolean;

  lastLoginAt: string | null;
  createdAt: string;

  accountInfo: IAccountInfo | null;

  defaultAddress: IAddress | null;

  notificationCount: number;
}

interface AuthState {
  user: IUser | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        user: IUser;
      }>,
    ) => {
      state.user = action.payload.user;
    },

    updateNotificationCount: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.notificationCount = action.payload;
      }
    },

    setLogout: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, updateNotificationCount, setLogout } =
  authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;

export const selectUserRole = (state: RootState) => state.auth.user?.role;

export const selectNotificationCount = (state: RootState) =>
  state.auth.user?.notificationCount ?? 0;
