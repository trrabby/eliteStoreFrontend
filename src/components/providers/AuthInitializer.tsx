/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import {
  setUser,
  setLogout,
  selectCurrentUser,
} from "@/store/slices/authSlice";
import {
  setCart,
  syncCartWithServer,
  startSync,
} from "@/store/slices/cartSlice";
import { setWishlist } from "@/store/slices/wishlistSlice";
import { setNotifications } from "@/store/slices/notificationSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getMyProfile } from "@/services/user.service";
import { getCart, addToCart } from "@/services/cart.service";
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
  const guestItems = useSelector((s: RootState) => s.cart.items);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Cookie gone but Redux still has user → clear
    if (!isAuthenticated && user) {
      dispatch(setLogout());
      return;
    }

    // Cookie present but Redux empty → hydrate
    if (isAuthenticated && !user) {
      const hydrate = async () => {
        try {
          const [profileRes, cartRes, wishlistRes, notifRes] =
            await Promise.all([
              getMyProfile(),
              getCart(),
              getWishlist(),
              getMyNotifications({}),
            ]);

          if (profileRes?.success) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dispatch(setUser({ user: normalizeUser(profileRes as any) }));
          }

          /* ── Sync guest cart items to server ──
           * guestItems: items that were added while not logged in
           * (identified by cartId === 0)                          */
          const guestCartItems = guestItems.filter((i) => i.cartId === 0);

          if (guestCartItems.length > 0 && cartRes?.success) {
            dispatch(startSync());

            // POST each guest item to server (best-effort, ignore errors)
            await Promise.allSettled(
              guestCartItems.map((item) => {
                const fd = new FormData();
                fd.append(
                  "data",
                  JSON.stringify({
                    variantId: item.variantId,
                    quantity: item.quantity,
                  }),
                );
                return addToCart(fd);
              }),
            );

            // Fetch merged server cart
            const mergedCart = await getCart();
            if (mergedCart?.success && mergedCart.data) {
              // syncCartWithServer merges & clears localStorage
              dispatch(syncCartWithServer(mergedCart.data));
            }
          } else if (cartRes?.success && cartRes.data) {
            dispatch(setCart(cartRes.data));
          }

          if (wishlistRes?.success) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ids = (wishlistRes.data?.items ?? []).map(
              (i: any) => i.productId as number,
            );
            dispatch(setWishlist(ids));
          }

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
