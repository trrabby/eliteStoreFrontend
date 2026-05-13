"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductFilters } from "./ProductFilters";

type MobileFilterDrawerProps = {
  categories: { id: number; name: string; slug: string }[];
  brands: { id: number; name: string; slug: string }[];
};

export function MobileFilterDrawer({
  categories,
  brands,
}: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5
                   rounded-xl border-2 border-gray-200 text-sm font-medium
                   text-gray-700 hover:border-primary hover:text-primary
                   transition-all flex-shrink-0"
      >
        <SlidersHorizontal size={16} />
        Filters
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-[300px] bg-white
                         z-50 overflow-y-auto p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-gray-900">
                  Filters
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              <ProductFilters
                categories={categories}
                brands={brands}
                onClose={() => setOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
