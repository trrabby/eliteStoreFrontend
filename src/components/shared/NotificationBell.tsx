"use client";

import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { markAllRead } from "@/store/slices/notificationSlice";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector((s: RootState) => s.notification);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-600 hover:text-primary transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary
                       text-white text-xs font-bold rounded-full
                       flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white
                       rounded-2xl shadow-pink-lg border border-gray-100
                       overflow-hidden z-50"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3
                            border-b border-gray-100"
            >
              <span className="font-semibold text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllRead())}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">
                  No notifications yet
                </div>
              ) : (
                items.slice(0, 8).map((n) => (
                  <Link
                    key={n.id}
                    href={n.link ?? "/account/notifications"}
                    onClick={() => setOpen(false)}
                    className={`flex gap-3 px-4 py-3 hover:bg-gray-50
                                transition-colors border-b border-gray-50
                                ${!n.isRead ? "bg-primary-pale/40" : ""}`}
                  >
                    {/* Type icon */}
                    <div
                      className="w-9 h-9 rounded-full bg-gradient-primary
                                    flex-shrink-0 flex items-center justify-center
                                    text-white text-sm"
                    >
                      {n.type === "ORDER_UPDATE"
                        ? "📦"
                        : n.type === "PAYMENT"
                          ? "💳"
                          : n.type === "PROMOTION"
                            ? "🎉"
                            : n.type === "REVIEW"
                              ? "⭐"
                              : n.type === "RESTOCK"
                                ? "📬"
                                : "🔔"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${!n.isRead ? "font-semibold" : "font-medium"} text-gray-900 truncate`}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </Link>
                ))
              )}
            </div>

            {/* Footer */}
            <Link
              href="/account/notifications"
              onClick={() => setOpen(false)}
              className="block text-center py-3 text-sm text-primary
                         font-medium hover:bg-primary-pale transition-colors
                         border-t border-gray-100"
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
