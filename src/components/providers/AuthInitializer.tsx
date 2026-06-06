/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import {
  setUser,
  setLogout,
  selectCurrentUser,
} from "@/store/slices/authSlice";
import { setItemsFromDB, clearCart, startSync } from "@/store/slices/cartSlice";
import { setWishlist } from "@/store/slices/wishlistSlice";
import { setNotifications } from "@/store/slices/notificationSlice";
import { RootState } from "@/store";
import { getMyProfile } from "@/services/user.service";
import { addToCart, getCart } from "@/services/cart.service";
import { getWishlist } from "@/services/wishlist.service";
import { getMyNotifications } from "@/services/notification.service";
import { normalizeUser } from "@/lib/utils/normalizeUser";

export function AuthInitializer({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const localItems = useSelector((s: RootState) => s.cart.items);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Cookie gone but Redux still has user → clear
    if (!isAuthenticated && user) {
      dispatch(setLogout());
      dispatch(clearCart());
      return;
    }

    // Cookie present but Redux has no user → hydrate
    if (isAuthenticated && !user) {
      const hydrate = async () => {
        try {
          const [profileRes, wishlistRes, notifRes] = await Promise.all([
            getMyProfile(),
            getWishlist(),
            getMyNotifications({}),
          ]);

          if (profileRes?.success) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dispatch(setUser({ user: normalizeUser(profileRes as any) }));
          }

          // ── Sync persisted local cart items → DB ──
          const itemsToSync = [...localItems]; // snapshot before async ops
          if (itemsToSync.length > 0) {
            dispatch(startSync());
            await Promise.allSettled(
              itemsToSync.map((item) => {
                const fd = new FormData();
                fd.append(
                  "data",
                  JSON.stringify({
                    variantId: item.variantId,
                    productId: item.productId,
                    quantity: item.quantity,
                  }),
                );
                return addToCart(fd);
              }),
            );
          }

          // ── Fetch merged DB cart → replace local state ──
          const cartRes = await getCart();
          if (cartRes?.success && Array.isArray(cartRes.data?.items)) {
            dispatch(setItemsFromDB(cartRes.data.items));
          }

          // ── Wishlist ──
          if (wishlistRes?.success) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ids = (wishlistRes.data?.items ?? []).map(
              (i: any) => i.productId as number,
            );
            dispatch(setWishlist(ids));
          }

          // ── Notifications ──
          if (notifRes?.success) {
            dispatch(
              setNotifications({
                notifications:
                  notifRes.data?.notifications ?? notifRes.data ?? [],
                unreadCount: notifRes.data?.unreadCount ?? 0,
              }),
            );
          }
        } catch {
          // silent — user stays unauthenticated
        }
      };
      hydrate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return null;
}
