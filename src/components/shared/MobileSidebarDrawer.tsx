"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  dark?: boolean;
};

export function MobileSidebarDrawer({
  open,
  onClose,
  children,
  title,
  dark = false,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
              fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col
              shadow-2xl overflow-y-auto lg:hidden
              ${dark ? "bg-gray-900" : "bg-white"}
            `}
          >
            {/* Header */}
            <div
              className={`
              flex items-center justify-between px-4 py-4 border-b
              ${dark ? "border-gray-800" : "border-gray-100"}
            `}
            >
              {title && (
                <span
                  className={`font-semibold text-sm ${dark ? "text-white" : "text-gray-900"}`}
                >
                  {title}
                </span>
              )}
              <button
                onClick={onClose}
                className={`
                  p-2 rounded-xl ml-auto transition-colors
                  ${
                    dark
                      ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                      : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  }
                `}
              >
                <X size={18} />
              </button>
            </div>

            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
