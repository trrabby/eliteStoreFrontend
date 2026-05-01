"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { clearToast } from "@/store/slices/notificationSlice";
import { useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";

export function NotificationToast() {
  const dispatch = useDispatch();
  const toast = useSelector((s: RootState) => s.notification.showToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dispatch(clearToast()), 5000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-20 lg:bottom-6 right-4 z-50
                     w-80 bg-white rounded-2xl shadow-pink-lg
                     border border-primary-pale overflow-hidden"
        >
          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: "linear" }}
            className="h-0.5 bg-gradient-primary origin-left"
          />

          <div className="flex items-start gap-3 p-4">
            <div
              className="w-10 h-10 rounded-full bg-gradient-primary
                            flex-shrink-0 flex items-center justify-center
                            text-xl"
            >
              {toast.type === "ORDER_UPDATE"
                ? "📦"
                : toast.type === "PAYMENT"
                  ? "💳"
                  : toast.type === "PROMOTION"
                    ? "🎉"
                    : toast.type === "REVIEW"
                      ? "⭐"
                      : "🔔"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900">
                {toast.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {toast.body}
              </p>
              {toast.link && (
                <Link
                  href={toast.link}
                  onClick={() => dispatch(clearToast())}
                  className="text-xs text-primary font-medium mt-1 hover:underline"
                >
                  View details →
                </Link>
              )}
            </div>
            <button
              onClick={() => dispatch(clearToast())}
              className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
