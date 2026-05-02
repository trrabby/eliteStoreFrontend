"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationToast } from "@/components/shared/NotificationToast";
import { SocketProvider } from "@/components/providers/SocketProvider";
import {
  User,
  MapPin,
  Package,
  RotateCcw,
  Star,
  Heart,
  Wallet,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";

const ACCOUNT_NAV = [
  { icon: User, label: "My Profile", href: "/account" },
  { icon: MapPin, label: "Addresses", href: "/account/addresses" },
  { icon: Package, label: "My Orders", href: "/account/orders" },
  { icon: RotateCcw, label: "Returns", href: "/account/returns" },
  { icon: Star, label: "My Reviews", href: "/account/reviews" },
  { icon: Heart, label: "Wishlist", href: "/account/wishlist" },
  { icon: Wallet, label: "Wallet", href: "/account/wallet" },
  { icon: Bell, label: "Notifications", href: "/account/notifications" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // guard
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [isLoading, isLoggedIn, router, pathname]);

  if (isLoading || !isLoggedIn) return null;

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 py-3">
          <div className="container-elite flex items-center justify-between">
            <Link href="/">
              <Logo size="sm" />
            </Link>
            <span className="text-sm text-gray-500">My Account</span>
          </div>
        </header>

        <div className="container-elite py-6">
          <div className="flex gap-6">
            {/* Sidebar — desktop */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="card p-5 sticky top-24">
                {/* User info */}
                <div
                  className="flex items-center gap-3 mb-6 pb-5
                                border-b border-gray-100"
                >
                  <div
                    className="w-12 h-12 rounded-full bg-gradient-primary
                                  flex items-center justify-center
                                  text-white font-bold text-lg shrink-0"
                  >
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Nav links */}
                <nav className="space-y-1">
                  {ACCOUNT_NAV.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/account" &&
                        pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5
                                   rounded-xl text-sm font-medium
                                   transition-all duration-200
                                   ${
                                     isActive
                                       ? "bg-primary-pale text-primary"
                                       : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                   }`}
                      >
                        <item.icon
                          size={16}
                          className={
                            isActive ? "text-primary" : "text-gray-400"
                          }
                        />
                        <span className="flex-1">{item.label}</span>
                        {isActive && (
                          <ChevronRight size={14} className="text-primary" />
                        )}
                      </Link>
                    );
                  })}

                  {/* Logout */}
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5
                               rounded-xl text-sm font-medium text-red-500
                               hover:bg-red-50 transition-all duration-200
                               mt-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-w-0"
            >
              {children}
            </motion.main>
          </div>
        </div>

        <MobileNav />
        <NotificationToast />
      </div>
    </SocketProvider>
  );
}
