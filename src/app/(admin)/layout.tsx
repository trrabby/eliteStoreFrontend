"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
} from "lucide-react";
import { motion } from "framer-motion";
import { NotificationToast } from "@/components/shared/NotificationToast";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { useAuth } from "@/lib/hooks/useAuth";

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Store, label: "Vendors", href: "/admin/vendors" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: Grid, label: "Categories", href: "/admin/categories" },
  { icon: Award, label: "Brands", href: "/admin/brands" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: Truck, label: "Shipments", href: "/admin/shipments" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: RotateCcw, label: "Returns", href: "/admin/returns" },
  { icon: Star, label: "Reviews", href: "/admin/reviews" },
  { icon: Tag, label: "Coupons", href: "/admin/coupons" },
  { icon: Wallet, label: "Wallet", href: "/admin/wallet" },
  { icon: Bell, label: "Notifications", href: "/admin/notifications" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoggedIn, isLoading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !isAdmin)) {
      router.push("/");
    }
  }, [isLoading, isLoggedIn, isAdmin, router]);

  if (isLoading || !isLoggedIn) return null;

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside
          className="hidden lg:flex w-60 bg-gray-900 flex-col
                          sticky top-0 h-screen overflow-y-auto"
        >
          <div className="p-5 border-b border-gray-800">
            <div className="font-display font-bold text-xl">
              <span className="text-white">Elite</span>
              <span className="text-primary"> Admin</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-0.5">
            {ADMIN_NAV.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5
                             rounded-xl text-sm font-medium
                             transition-all duration-200
                             ${
                               isActive
                                 ? "bg-primary text-white"
                                 : "text-gray-400 hover:bg-gray-800 hover:text-white"
                             }`}
                >
                  <item.icon size={16} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight size={14} />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div
                className="w-8 h-8 rounded-full bg-gradient-primary
                              flex items-center justify-center text-white
                              text-xs font-bold shrink-0"
              >
                {user?.firstName?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2
                         rounded-xl text-sm text-gray-400
                         hover:bg-gray-800 hover:text-red-400
                         transition-all"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header
            className="bg-white border-b border-gray-100 px-6 py-4
                             flex items-center justify-between sticky top-0 z-10"
          >
            <h1 className="font-display font-semibold text-gray-900">
              {ADMIN_NAV.find((n) => pathname.startsWith(n.href))?.label ??
                "Dashboard"}
            </h1>
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-primary
                                      transition-colors"
            >
              ← Back to store
            </Link>
          </header>

          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 p-6 overflow-auto"
          >
            {children}
          </motion.main>
        </div>

        <NotificationToast />
      </div>
    </SocketProvider>
  );
}
