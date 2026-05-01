import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type User = {
  publicId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isEmailVerified: boolean;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: true,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isLoading = false;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

// export current user
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectAccessToken = (state: { auth: AuthState }) =>
  state.auth.accessToken;
export const { setCredentials, clearCredentials, setLoading } =
  authSlice.actions;
