/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationToast } from "@/components/shared/NotificationToast";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { MobileSidebarDrawer } from "@/components/shared/MobileSidebarDrawer";
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
  Menu,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { toast } from "sonner";
import Image from "next/image";
import { useLogout } from "@/lib/hooks/useLogout";

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

function AccountNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const logout = useLogout();
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch {
      toast.error("Something went wrong");
    }
  };

  const initials = `${user?.accountInfo?.firstName?.[0] ?? ""}${
    user?.accountInfo?.lastName?.[0] ?? ""
  }`.toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className="flex items-center gap-3 p-5 border-b border-gray-100">
        <div className="w-11 h-11 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-base shrink-0 overflow-hidden">
          {user?.accountInfo?.avatar ? (
            <Image
              src={user.accountInfo.avatar}
              alt={initials}
              width={44}
              height={44}
              className="object-cover w-full h-full"
            />
          ) : (
            initials || "U"
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {user?.accountInfo?.firstName} {user?.accountInfo?.lastName}
          </p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {ACCOUNT_NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/account" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? "bg-primary-pale text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <item.icon
                size={16}
                className={isActive ? "text-primary" : "text-gray-400"}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} className="text-primary" />}
            </Link>
          );
        })}
        {(user && user.role === "ADMIN") ||
          (user && user.role === "SUPER_ADMIN" && (
            <Link
              href="/admin/dashboard"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
            >
              <Settings size={16} />
              <span className="flex-1">Admin Panel</span>
            </Link>
          ))}
        {user && user.role === "VENDOR" && (
          <Link
            href="/vendor/dashboard"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
          >
            <Settings size={16} />
            <span className="flex-1">Vendor Panel</span>
          </Link>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                     text-sm font-medium text-red-500 hover:bg-red-50
                     transition-all duration-200 cursor-pointer"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppSelector(selectCurrentUser);
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Redirect if not logged in - same pattern as AdminLayout
  useEffect(() => {
    if (!user) {
      router.replace(`/login?redirect=${pathname}`);
    }
  }, [user, router, pathname]);

  // Close drawer on route change - MOVED BEFORE EARLY RETURN
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Early returns after all hooks are declared
  if (!user) return null;

  const currentLabel =
    ACCOUNT_NAV.find(
      (n) =>
        pathname === n.href ||
        (n.href !== "/account" && pathname.startsWith(n.href)),
    )?.label ?? "My Account";

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar drawer */}
        <MobileSidebarDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="My Account"
        >
          <AccountNav
            pathname={pathname}
            onNavigate={() => setDrawerOpen(false)}
          />
        </MobileSidebarDrawer>

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 py-3 sticky top-0 z-40">
          <div className="container-elite flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden p-2 -ml-1 rounded-xl text-gray-500
                           hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Open account menu"
              >
                <Menu size={20} />
              </button>
              <Link href="/">
                <Logo size="sm" />
              </Link>
            </div>
            <span className="text-sm text-gray-500 font-medium">
              {currentLabel}
            </span>
          </div>
        </header>

        <div className="container-elite py-6">
          <div className="flex gap-6">
            {/* Sidebar — desktop only */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="card sticky top-24 overflow-hidden">
                <AccountNav pathname={pathname} />
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

        {/* Bottom nav only on mobile */}
        <MobileNav />
        <NotificationToast />
      </div>
    </SocketProvider>
  );
}
