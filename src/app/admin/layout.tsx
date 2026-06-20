/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Grid,
  Award,
  ShoppingCart,
  Truck,
  CreditCard,
  RotateCcw,
  Star,
  Tag,
  Wallet,
  Bell,
  ChevronRight,
  LogOut,
  Menu,
  BadgePercent,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { NotificationToast } from "@/components/shared/NotificationToast";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { MobileSidebarDrawer } from "@/components/shared/MobileSidebarDrawer";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { useLogout } from "@/lib/hooks/useLogout";

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Store, label: "Vendors", href: "/admin/vendors" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: Grid, label: "Categories", href: "/admin/categories" },
  { icon: Award, label: "Brands", href: "/admin/brands" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: Truck, label: "Shipments", href: "/admin/shipments" },
  { icon: Wallet, label: "Withdrawals", href: "/admin/withdrawals" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: RotateCcw, label: "Returns", href: "/admin/returns" },
  { icon: BadgePercent, label: "Flash Sales", href: "/admin/flash-sales" },
  { icon: Tag, label: "Coupons", href: "/admin/coupons" },
  { icon: Star, label: "Reviews", href: "/admin/reviews" },
  { icon: Wallet, label: "Wallet", href: "/admin/wallet" },
  { icon: Bell, label: "Notifications", href: "/admin/notifications" },
];

function AdminNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const logout = useLogout();
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);

  const firstName = user?.accountInfo?.firstName ?? "";
  const lastName = user?.accountInfo?.lastName ?? "";
  const avatarLetter = firstName.charAt(0).toUpperCase() || "A";

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-gray-800">
        <div className="font-display font-bold text-xl">
          <span className="text-white">Elite</span>
          <span className="text-primary"> Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {ADMIN_NAV.map((item) => {
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
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              <item.icon size={15} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={13} />}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
            {avatarLetter}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {firstName} {lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl
                     text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400
                     transition-all"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({
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
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user.role);
    if (!isAdmin) router.replace("/");
  }, [user, router]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (!user) return null;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user.role);
  if (!isAdmin) return null;

  const currentLabel =
    ADMIN_NAV.find((n) => pathname.startsWith(n.href))?.label ?? "Dashboard";

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile sidebar drawer — dark */}
        <MobileSidebarDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          dark
        >
          <AdminNav
            pathname={pathname}
            onNavigate={() => setDrawerOpen(false)}
          />
        </MobileSidebarDrawer>

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-60 bg-gray-900 flex-col sticky top-0 h-screen overflow-y-auto">
          <AdminNav pathname={pathname} />
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden p-2 -ml-1 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <h1 className="font-display font-semibold text-gray-900 text-base">
                {currentLabel}
              </h1>
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
