// useLogout.ts
"use client";

import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hook";

import { setLogout } from "@/store/slices/authSlice";
import { setCart } from "@/store/slices/cartSlice";
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
      dispatch(
        setCart({
          id: null,
          itemCount: 0,
          items: [],
          subtotal: 0,
          savings: 0,
        }),
      );

      // 4. Redirect to desired path
      router.push(redirectTo);

      // 5. Notify success
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Something went wrong while logging out");
    }
  };

  return logout;
};
