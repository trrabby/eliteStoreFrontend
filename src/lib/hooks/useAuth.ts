"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { clearCredentials } from "@/store/slices/authSlice";
import { logout as logoutService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const auth = useSelector((s: RootState) => s.auth);

  const logout = async () => {
    await logoutService();
    dispatch(clearCredentials());
    router.push("/login");
  };

  const isLoggedIn = !!auth.user;
  const isAdmin =
    auth.user?.role === "ADMIN" || auth.user?.role === "SUPER_ADMIN";
  const isVendor = auth.user?.role === "VENDOR";
  const isCustomer = auth.user?.role === "CUSTOMER";

  return {
    user: auth.user,
    accessToken: auth.accessToken,
    isLoading: auth.isLoading,
    isLoggedIn,
    isAdmin,
    isVendor,
    isCustomer,
    logout,
  };
};
