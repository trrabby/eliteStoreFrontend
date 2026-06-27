/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Archive,
  Star,
  Store,
  ChevronRight,
  LogOut,
  Menu,
  Wallet,
  BadgePercent,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { NotificationToast } from "@/components/shared/NotificationToast";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { MobileSidebarDrawer } from "@/components/shared/MobileSidebarDrawer";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { setLogout, selectCurrentUser } from "@/store/slices/authSlice";
import { useLogout } from "@/lib/hooks/useLogout";
import { useUsers } from "@/lib/hooks/useUser";
import { toast } from "sonner";

const VENDOR_NAV = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/vendor/dashboard" },
  { icon: Package, label: "Products", href: "/vendor/products" },
  { icon: ShoppingCart, label: "Orders", href: "/vendor/orders" },
  { icon: Wallet, label: "Withdrawals", href: "/vendor/withdrawals" },
  { icon: Archive, label: "Inventory", href: "/vendor/inventory" },
  { icon: BadgePercent, label: "Flash Sales", href: "/vendor/flash-sales" },
  { icon: Tag, label: "Coupons", href: "/vendor/coupons" },
  { icon: Star, label: "Reviews", href: "/vendor/reviews" },
  { icon: Store, label: "My Store", href: "/vendor/store" },
];

function VendorNav({
  pathname,
  onNavigate,
  dark = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  dark?: boolean;
}) {
  const user = useAppSelector(selectCurrentUser);
  const { userAndNoAccesstoken } = useUsers();
  const firstName = user?.accountInfo?.firstName ?? "";
  const lastName = user?.accountInfo?.lastName ?? "";
  const avatarLetter = firstName.charAt(0).toUpperCase() || "V";
  const logout = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  if (userAndNoAccesstoken) {
    handleLogout();
    toast.error("Session Expired. Please Login");
  }
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      {dark ? (
        <div className="p-5 border-b border-gray-800">
          <div className="font-display font-bold text-xl">
            <span className="text-white">Elite</span>
            <span className="text-primary"> Vendor</span>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-gray-100">
          <Link href="/" onClick={onNavigate}>
            <Logo size="sm" />
          </Link>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">
            Vendor Panel
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {VENDOR_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-medium transition-all duration-200
                ${
                  dark
                    ? isActive
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    : isActive
                    ? "bg-primary-pale text-primary"
                    : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <item.icon
                size={16}
                className={dark && !isActive ? "text-gray-400" : ""}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && !dark && (
                <ChevronRight size={14} className="text-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div
        className={`p-4 border-t ${
          dark ? "border-gray-800" : "border-gray-100"
        }`}
      >
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
            {avatarLetter}
          </div>
          <div className="min-w-0">
            <p
              className={`text-xs font-medium truncate ${
                dark ? "text-white" : "text-gray-900"
              }`}
            >
              {firstName} {lastName}
            </p>
            <p
              className={`text-xs truncate ${
                dark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {user?.role?.toLowerCase()}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-2 px-3 py-2 rounded-xl
            text-sm transition-all cursor-pointer justify-center
            ${
              dark
                ? "text-gray-400 hover:bg-gray-800 hover:text-red-400"
                : "text-red-500 hover:bg-red-50"
            }
          `}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppSelector(selectCurrentUser);
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    const allowed = ["VENDOR", "ADMIN", "SUPER_ADMIN"].includes(user.role);
    if (!allowed) router.replace("/");
  }, [user, router]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (!user) return null;
  const allowed = ["VENDOR", "ADMIN", "SUPER_ADMIN"].includes(user.role);
  if (!allowed) return null;

  const currentLabel =
    VENDOR_NAV.find((n) => pathname.startsWith(n.href))?.label ?? "Dashboard";

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile sidebar drawer */}
        <MobileSidebarDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Vendor Panel"
        >
          <VendorNav
            pathname={pathname}
            onNavigate={() => setDrawerOpen(false)}
          />
        </MobileSidebarDrawer>

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-60 bg-white border-r border-gray-100 flex-col sticky top-0 h-screen overflow-y-auto">
          <VendorNav pathname={pathname} />
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white border-b lg:hidden border-gray-100 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden p-2 -ml-1 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              {/* <h1 className="font-display h-9 font-semibold text-gray-900 text-base">
                {currentLabel}
              </h1> */}
            </div>
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-primary transition-colors"
            >
              ← Back to store
            </Link>
          </header>

          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 p-4 lg:p-6 overflow-auto"
          >
            {children}
          </motion.main>
        </div>

        <NotificationToast />
      </div>
    </SocketProvider>
  );
}
