"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Search, Heart, User } from "lucide-react";
import { useDispatch } from "react-redux";
import { toggleSearch } from "@/store/slices/uiSlice";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Grid, label: "Categories", href: "/products" },
  { icon: Search, label: "Search", href: null, action: "search" },
  { icon: Heart, label: "Wishlist", href: "/account/wishlist" },
  { icon: User, label: "Account", href: "/account" },
];

export function MobileNav() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const user = useAppSelector(selectCurrentUser);

  // Hide bottom nav inside vendor/admin panels
  if (pathname.startsWith("/vendor") || pathname.startsWith("/admin")) {
    return null;
  }

  const isActive = (href: string | null) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    // account section — all /account/* paths activate the account tab
    if (href === "/account") return pathname.startsWith("/account");
    if (href === "/account/wishlist") return pathname === "/account/wishlist";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40
                 bg-white border-t border-gray-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);

          const content = (
            <div
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 transition-all duration-200 relative",
                active ? "text-primary" : "text-gray-400",
              )}
            >
              {active && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
              <item.icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          );

          if (item.action === "search") {
            return (
              <button
                key="search"
                className="flex-1 flex justify-center"
                onClick={() => dispatch(toggleSearch())}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className="flex-1 flex justify-center"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
