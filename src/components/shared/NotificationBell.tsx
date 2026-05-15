"use client";

import Link from "next/link";

import { Bell } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { formatDistanceToNow } from "date-fns";

import { useEffect, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hook";

import { markAllRead, markSingleRead } from "@/store/slices/notificationSlice";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "ORDER_UPDATE":
      return "📦";

    case "PAYMENT":
      return "💳";

    case "PROMOTION":
      return "🎉";

    case "REVIEW":
      return "⭐";

    case "RESTOCK":
      return "📬";

    default:
      return "🔔";
  }
};

export function NotificationBell() {
  const dispatch = useAppDispatch();

  const { items, unreadCount } = useAppSelector((state) => state.notification);

  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  // close outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleMarkAllRead = async () => {
    // call backend here later

    dispatch(markAllRead());
  };

  const handleSingleRead = async (id: number) => {
    // call backend here later

    dispatch(markSingleRead(id));

    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={open}
        className="p-2 text-gray-600 hover:text-primary
                   transition-colors relative"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5
                       w-5 h-5 bg-primary text-white
                       text-xs font-bold rounded-full
                       flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 8,
              scale: 0.95,
            }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2
                       w-[22rem]
                       max-w-[calc(100vw-1rem)]
                       bg-white rounded-2xl
                       shadow-pink-lg border
                       border-gray-100 overflow-hidden
                       z-50"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between
                         px-4 py-3 border-b border-gray-100"
            >
              <span className="font-semibold text-gray-900">Notifications</span>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary
                             hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div
                  className="py-8 text-center
                             text-gray-400 text-sm"
                >
                  No notifications yet
                </div>
              ) : (
                items.slice(0, 8).map((n) => (
                  <Link
                    key={n.id}
                    href={n.link ?? "/account/notifications"}
                    onClick={() => handleSingleRead(n.id)}
                    className={`flex gap-3 px-4 py-3
                               hover:bg-gray-50
                               transition-colors
                               border-b border-gray-50
                               ${!n.isRead ? "bg-primary-pale/40" : ""}`}
                  >
                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-full
                                 bg-gradient-primary
                                 flex-shrink-0 flex
                                 items-center justify-center
                                 text-white text-sm"
                    >
                      {getNotificationIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate
                                   ${
                                     !n.isRead ? "font-semibold" : "font-medium"
                                   }
                                   text-gray-900`}
                      >
                        {n.title}
                      </p>

                      <p
                        className="text-xs text-gray-500
                                   mt-0.5 line-clamp-2"
                      >
                        {n.body}
                      </p>

                      {n.createdAt && (
                        <p
                          className="text-xs text-gray-400 mt-1"
                          suppressHydrationWarning
                        >
                          {formatDistanceToNow(new Date(n.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      )}
                    </div>

                    {!n.isRead && (
                      <div
                        className="w-2 h-2 rounded-full
                                   bg-primary flex-shrink-0
                                   mt-1.5"
                      />
                    )}
                  </Link>
                ))
              )}
            </div>

            {/* Footer */}
            <Link
              href="/account/notifications"
              onClick={() => setOpen(false)}
              className="block text-center py-3 text-sm
                         text-primary font-medium
                         hover:bg-primary-pale
                         transition-colors
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
