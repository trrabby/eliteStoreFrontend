"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Bell,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { toggleCart, toggleSearch } from "@/store/slices/uiSlice";
import { Logo } from "@/components/shared/Logo";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { SearchBar } from "@/components/shared/SearchBar";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function Header() {
  const dispatch = useDispatch();
  const cart = useSelector((s: RootState) => s.cart);
  const auth = useSelector((s: RootState) => s.auth);
  const ui = useSelector((s: RootState) => s.ui);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        {/* Top bar — promo message */}
        <div className="bg-gradient-primary text-white text-xs text-center py-2 font-medium">
          🎉 Free delivery on orders above ৳1000 — Shop Now!
        </div>

        {/* Main header */}
        <div className="container-elite h-16 flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
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
              className="lg:hidden p-2 text-gray-600 hover:text-primary transition-colors"
              onClick={() => dispatch(toggleSearch())}
            >
              <Search size={20} />
            </button>

            {/* Language */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Notifications */}
            {auth.user && <NotificationBell />}

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="p-2 text-gray-600 hover:text-primary transition-colors relative"
            >
              <Heart size={20} />
            </Link>

            {/* Cart */}
            <button
              className="p-2 text-gray-600 hover:text-primary transition-colors relative"
              onClick={() => dispatch(toggleCart())}
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary
                             text-white text-xs font-bold rounded-full
                             flex items-center justify-center"
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </motion.span>
              )}
            </button>

            {/* Account */}
            {auth.user ? (
              <Link
                href="/account"
                className="hidden sm:flex items-center gap-2 p-2 text-gray-600
                           hover:text-primary transition-colors"
              >
                {auth.user.avatar ? (
                  <img
                    src={auth.user.avatar}
                    alt={auth.user.firstName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary-pale"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full bg-gradient-primary
                                  flex items-center justify-center text-white text-xs font-bold"
                  >
                    {auth.user.firstName[0]}
                    {auth.user.lastName[0]}
                  </div>
                )}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 btn-secondary text-sm px-4 py-2"
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

      {/* Mobile search */}
      <AnimatePresence>
        {ui.isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-0 left-0 right-0 z-50
                       bg-white p-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <SearchBar autoFocus />
              <button
                onClick={() => dispatch(toggleSearch())}
                className="p-2 text-gray-400 hover:text-gray-900"
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
