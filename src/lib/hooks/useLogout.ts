"use client";

import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hook";

import { setLogout } from "@/store/slices/authSlice";
import { clearCart } from "@/store/slices/cartSlice"; // Changed: import clearCart instead of setCart
import { serverLogout } from "@/services/auth.service";

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const logout = async (redirectTo: string = "/login") => {
    try {
      // 1. Server logout
      await serverLogout();

      // 2. Sign out NextAuth without redirect
      await signOut({ redirect: false });

      // 3. Clear Redux state
      dispatch(setLogout());
      dispatch(clearCart()); // Changed: use clearCart action from cartSlice

      // 4. Clear any guest cart data from localStorage (optional)
      localStorage.removeItem("guest_cart");

      // 5. Redirect to desired path
      router.push(redirectTo);

      // 6. Notify success
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Something went wrong while logging out");
    }
  };

  return logout;
};
