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
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { CartDrawer } from "../cart/CartDrawer";
import Image from "next/image";

export function Header() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const cart = useSelector((s: RootState) => s.cart);
  const ui = useSelector((s: RootState) => s.ui);
  const { user, isLoggedIn } = useAuth();

  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  // close all drawers on route change
  useEffect(() => {
    dispatch(closeAll());
  }, [pathname, dispatch]);

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-white shadow-sm border-b
                         border-gray-100"
      >
        {/* Promo bar */}
        <div
          className="bg-gradient-primary text-white text-xs
                        text-center py-2 font-medium tracking-wide"
        >
          🎉 Free delivery on orders above ৳1000 &nbsp;|&nbsp; Cash on Delivery
          available
        </div>

        {/* Main header */}
        <div className="container-elite h-16 flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-primary
                       transition-colors"
            onClick={() => dispatch(toggleMobileMenu())}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>

          {/* Search bar — desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Search — mobile */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-primary
                         transition-colors"
              onClick={() => dispatch(toggleSearch())}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Notifications */}
            {isLoggedIn && <NotificationBell />}

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="p-2 text-gray-600 hover:text-primary
                         transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>

            {/* Cart */}
            <button
              className="p-2 text-gray-600 hover:text-primary
                         transition-colors relative"
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

            {/* Account */}
            {isLoggedIn ? (
              <Link
                href="/account"
                className="hidden sm:flex items-center gap-2 p-1"
                aria-label="Account"
              >
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.firstName}
                    height={10}
                    width={10}
                    className="w-8 h-8 rounded-full object-cover
                               border-2 border-primary-pale"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full bg-gradient-primary
                                  flex items-center justify-center
                                  text-white text-xs font-bold"
                  >
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                )}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2
                           btn-secondary text-sm px-4 py-2"
              >
                <User size={16} />
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Cart drawer */}
      <CartDrawer />

      {/* Mobile search overlay */}
      <AnimatePresence>
        {ui.isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-0 left-0 right-0 z-50
                       bg-white p-4 shadow-lg border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <SearchBar autoFocus />
              <button
                onClick={() => dispatch(toggleSearch())}
                className="p-2 text-gray-400 hover:text-gray-900
                           shrink-0"
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
