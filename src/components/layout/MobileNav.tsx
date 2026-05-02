"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Search, Heart, User } from "lucide-react";
import { useDispatch } from "react-redux";
import { toggleSearch } from "@/store/slices/uiSlice";

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

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40
                    bg-white border-t border-gray-200
                    safe-area-pb"
    >
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href ? pathname === item.href : false;

          const content = (
            <div
              className={`flex flex-col items-center gap-1 px-3 py-2
                             transition-all duration-200
                             ${
                               isActive
                                 ? "text-primary"
                                 : "text-gray-400 hover:text-gray-600"
                             }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div
                  className="absolute -top-px left-1/2 -translate-x-1/2
                                w-6 h-0.5 bg-primary rounded-full"
                />
              )}
            </div>
          );

          if (item.action === "search") {
            return (
              <button
                key="search"
                className="relative flex-1 flex justify-center"
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
              className="relative flex-1 flex justify-center"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
