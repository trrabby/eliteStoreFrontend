/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import {
  toggleCart,
  toggleSearch,
  toggleMobileMenu,
  closeAll,
} from "@/store/slices/uiSlice";
import { Logo } from "@/components/shared/Logo";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { SearchBar } from "@/components/shared/SearchBar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CartDrawer } from "../cart/CartDrawer";
import Image from "next/image";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser, setUser } from "@/store/slices/authSlice";
import { useSession } from "next-auth/react";
import { getMyProfile } from "@/services/user.service";
import { toast } from "sonner";
import { normalizeUser } from "@/lib/utils/normalizeUser";
import { getCart } from "@/services/cart.service";
import { getWishlist } from "@/services/wishlist.service";
import { getMyNotifications } from "@/services/notification.service";
import { setNotifications } from "@/store/slices/notificationSlice";
import { setWishlist } from "@/store/slices/wishlistSlice";
import { addToCart as addToCartAPI } from "@/services/cart.service";
import { setItemsFromDB, startSync, syncDone } from "@/store/slices/cartSlice";

export function Header() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const cart = useSelector((state: RootState) => state.cart);
  const isSearchOpen = useSelector((state: RootState) => state.ui.isSearchOpen);
  const { data: session, status } = useSession();

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    dispatch(closeAll());
  }, [pathname, dispatch]);

  // Handle user login and cart sync
  useEffect(() => {
    const syncReduxUser = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          // Check if we have guest cart items in localStorage
          const guestCartStr = localStorage.getItem("guest_cart");
          const hasGuestCart =
            guestCartStr && JSON.parse(guestCartStr)?.items?.length > 0;

          // Fetch user profile
          const profileResponse = await getMyProfile();
          if (!profileResponse?.success) {
            toast.error("Failed to retrieve user profile");
            return;
          }

          const reduxUser = normalizeUser(profileResponse as any);

          // Sync guest cart with server if exists
          if (hasGuestCart) {
            dispatch(startSync()); // From cartSlice

            try {
              const guestCart = JSON.parse(guestCartStr);
              const guestItems = guestCart.items;

              // Add each guest item to server cart using the API
              let allSuccess = true;
              for (const item of guestItems) {
                const formData = new FormData();
                formData.append(
                  "data",
                  JSON.stringify({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                  }),
                );

                const result = await addToCartAPI(formData);
                if (!result?.success) {
                  console.error(`Failed to sync item ${item.variantId}`);
                  allSuccess = false;
                }
              }

              if (allSuccess) {
                // Fetch fresh cart from server and update Redux
                const cartResponse = await getCart();
                if (
                  cartResponse?.success &&
                  Array.isArray(cartResponse.data?.items)
                ) {
                  // Use setItemsFromDB to update the cart state
                  dispatch(setItemsFromDB(cartResponse.data.items));
                }
                // Clear guest cart from localStorage after successful sync
                localStorage.removeItem("guest_cart");
                toast.success("Cart synced successfully!");
              } else {
                dispatch(syncDone()); // Set isSyncing to false
                toast.warning("Some items couldn't be synced");
              }
            } catch (error) {
              console.error("Cart sync error:", error);
              dispatch(syncDone());
              toast.error("Failed to sync cart");
            }
          } else {
            // No guest cart, just fetch the user's cart from server
            const cartResponse = await getCart();
            if (
              cartResponse?.success &&
              Array.isArray(cartResponse.data?.items)
            ) {
              dispatch(setItemsFromDB(cartResponse.data.items));
            }
          }

          // Fetch other user data (wishlist, notifications)
          const [wishlistResponse, notificationsResponse] = await Promise.all([
            getWishlist(),
            getMyNotifications({}),
          ]);

          // Hydrate redux with user data
          dispatch(setUser({ user: reduxUser }));

          if (wishlistResponse?.success) {
            const productIds = (wishlistResponse.data?.items ?? []).map(
              (item: any) => item.productId,
            );
            dispatch(setWishlist(productIds));
          }

          if (notificationsResponse?.success) {
            dispatch(setNotifications(notificationsResponse.data));
          }
        } catch (error) {
          console.error("Error syncing user data:", error);
          toast.error("Failed to sync your data");
          dispatch(syncDone());
        }
      }
    };

    syncReduxUser();
  }, [session, status, dispatch]);

  const user = useAppSelector(selectCurrentUser);

  return (
    <>
      <header className="sticky top-0 z-50 bg-brand-50 border-b border-brand-100 shadow-sm">
        {/* Promo bar */}
        <div className="bg-primary text-white text-xs text-center py-2 font-medium tracking-wide">
          🎉 Free delivery on orders above ৳2000 &nbsp;|&nbsp; Cash on Delivery
          available
        </div>

        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 text-brand-600 hover:text-primary transition-colors"
            onClick={() => dispatch(toggleMobileMenu())}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="flex items-center" aria-label="Elite Store">
            <Logo size="lg" />
          </Link>

          {/* Desktop search */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>

          <div className="flex items-center gap-1 ml-auto">
            {/* Mobile search button */}
            <button
              className="lg:hidden p-2 text-brand-600 hover:text-primary transition-colors"
              onClick={() => dispatch(toggleSearch())}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {mounted && user && <NotificationBell />}

            <Link
              href="/account/wishlist"
              className="p-2 text-brand-600 hover:text-primary transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>

            {/* Cart button */}
            <button
              className="p-2 text-brand-600 hover:text-primary transition-colors relative"
              onClick={() => dispatch(toggleCart())}
              aria-label="Cart"
            >
              <ShoppingBag size={20} />

              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5
                               bg-primary text-white text-xs font-bold
                               rounded-full flex items-center justify-center"
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* User account section */}
            {mounted &&
              (user ? (
                <Link
                  href="/account"
                  className="hidden sm:flex items-center gap-2 p-1"
                  aria-label="Account"
                >
                  {user.accountInfo?.avatar ? (
                    <Image
                      src={user.accountInfo.avatar}
                      alt={user.accountInfo.firstName || "User avatar"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary-light"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                      {user.accountInfo?.firstName?.[0]}
                      {user.accountInfo?.lastName?.[0]}
                    </div>
                  )}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-2 text-sm px-4 py-2
                           border border-primary text-primary rounded-md
                           hover:bg-primary hover:text-white transition"
                >
                  <User size={16} />
                  Login
                </Link>
              ))}
          </div>
        </div>
      </header>

      <CartDrawer />

      {/* Mobile search overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-0 left-0 right-0 z-50
                       bg-brand-50 p-4 shadow-lg border-b border-brand-100"
          >
            <div className="flex items-center gap-3">
              <SearchBar autoFocus />
              <button
                onClick={() => dispatch(toggleSearch())}
                className="p-2 text-brand-400 hover:text-brand-700 shrink-0 transition"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
