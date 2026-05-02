"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Archive,
  Star,
  Store,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { NotificationToast } from "@/components/shared/NotificationToast";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { useAuth } from "@/lib/hooks/useAuth";

const VENDOR_NAV = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/vendor/dashboard" },
  { icon: Package, label: "Products", href: "/vendor/products" },
  { icon: ShoppingCart, label: "Orders", href: "/vendor/orders" },
  { icon: Archive, label: "Inventory", href: "/vendor/inventory" },
  { icon: Star, label: "Reviews", href: "/vendor/reviews" },
  { icon: Store, label: "My Store", href: "/vendor/store" },
];

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoggedIn, isLoading, isVendor, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || (!isVendor && !isAdmin))) {
      router.push("/");
    }
  }, [isLoading, isLoggedIn, isVendor, isAdmin, router]);

  if (isLoading || !isLoggedIn) return null;

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside
          className="hidden lg:flex w-60 bg-white border-r
                          border-gray-100 flex-col sticky top-0
                          h-screen overflow-y-auto"
        >
          <div className="p-5 border-b border-gray-100">
            <Link href="/">
              <Logo size="sm" />
            </Link>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              Vendor Panel
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {VENDOR_NAV.map((item) => {
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
                                 ? "bg-primary-pale text-primary"
                                 : "text-gray-600 hover:bg-gray-50"
                             }`}
                >
                  <item.icon
                    size={16}
                    className={isActive ? "text-primary" : "text-gray-400"}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight size={14} className="text-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5
                         rounded-xl text-sm text-red-500
                         hover:bg-red-50 transition-all"
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
                             flex items-center justify-between"
          >
            <h1 className="font-display font-semibold text-gray-900">
              {VENDOR_NAV.find((n) => pathname.startsWith(n.href))?.label ??
                "Dashboard"}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div
                className="w-7 h-7 rounded-full bg-gradient-primary
                              flex items-center justify-center text-white
                              text-xs font-bold"
              >
                {user?.firstName?.[0]}
              </div>
              {user?.firstName}
            </div>
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
