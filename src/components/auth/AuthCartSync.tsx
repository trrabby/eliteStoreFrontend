// components/auth/AuthCartSync.tsx
"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/lib/hooks/useCart";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";

export function AuthCartSync() {
  const user = useAppSelector(selectCurrentUser);
  const { syncGuestCart, isSyncing } = useCart();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (user && !isSyncing && !hasSynced.current) {
      hasSynced.current = true;
      syncGuestCart();
    }

    if (!user) {
      hasSynced.current = false;
    }
  }, [user, isSyncing, syncGuestCart]);

  return null;
}
