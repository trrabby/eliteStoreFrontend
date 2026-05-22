/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils/cn";

const TYPE_ICONS: Record<string, string> = {
  ORDER_UPDATE: "📦",
  PAYMENT: "💳",
  PROMOTION: "🎉",
  REVIEW: "⭐",
  RESTOCK: "📬",
  SYSTEM: "🔔",
};

const TYPE_TABS = ["ALL", "ORDER_UPDATE", "PAYMENT", "PROMOTION", "SYSTEM"];

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markOneRead,
    markAllRead,
    deleteNotification,
    clearReadNotifications,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState("ALL");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
  }, []);

  const filtered =
    activeTab === "ALL"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-sm bg-primary text-white px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
          <button
            onClick={clearReadNotifications}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
            Clear read
          </button>
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-xl text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-primary text-white shadow-pink"
                : "bg-white border border-gray-200 text-gray-600 hover:border-primary",
            )}
          >
            {tab === "ALL"
              ? "All"
              : tab.replace("_", " ").charAt(0) +
                tab.replace("_", " ").slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {!mounted ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center gap-3">
          <Bell size={48} className="text-gray-200" />
          <p className="text-gray-500">No notifications here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "card p-4 flex gap-3 transition-all cursor-default",
                  !n.isRead && "border-l-4 border-l-primary bg-primary-pale/20",
                )}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-lg shrink-0">
                  {TYPE_ICONS[n.type] ?? "🔔"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm",
                      !n.isRead
                        ? "font-semibold text-gray-900"
                        : "font-medium text-gray-700",
                    )}
                  >
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {n.body}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {n.createdAt && (
                      <span
                        className="text-xs text-gray-400"
                        suppressHydrationWarning
                      >
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => markOneRead(n.id)}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markOneRead(n.id)}
                      title="Mark read"
                      className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                    >
                      <Check size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
