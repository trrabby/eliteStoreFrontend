"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { FileText, Tag } from "lucide-react";

type ProductDetailTabsProps = {
  description: string | null;
  attributes: { name: string; value: string }[];
};

const TABS = [
  { id: "description", label: "Description", icon: FileText },
  { id: "specs", label: "Specifications", icon: Tag },
];

export function ProductDetailTabs({
  description,
  attributes,
}: ProductDetailTabsProps) {
  const [active, setActive] = useState("description");

  return (
    <div className="mb-8">
      {/* Tab buttons with improved styling */}
      <div className="flex gap-1 border-b border-gray-200/80 mb-8">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-all duration-200",
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-700",
              )}
            >
              <Icon
                size={16}
                className={cn(
                  "transition-colors",
                  isActive ? "text-primary" : "text-gray-400",
                )}
              />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary to-primary/60 rounded-full"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content with improved styling */}
      <AnimatePresence mode="wait">
        {active === "description" && (
          <motion.div
            key="description"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed p-6 rounded-2xl border text-justify"
          >
            <div
              dangerouslySetInnerHTML={{
                __html: description ?? "<p>No description available.</p>",
              }}
            />
          </motion.div>
        )}

        {active === "specs" && (
          <motion.div
            key="specs"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {attributes.length === 0 ? (
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/60 text-center text-gray-400 text-sm">
                No specifications available.
              </div>
            ) : (
              <div className="bg-gray-50/50 rounded-2xl border border-gray-100/60 overflow-hidden">
                {attributes.map((attr, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-6 px-6 py-3.5 transition-colors",
                      i % 2 === 0 ? "bg-white/50" : "bg-transparent",
                      "hover:bg-gray-100/50",
                    )}
                  >
                    <span className="text-sm font-medium text-gray-500 w-36 shrink-0">
                      {attr.name}
                    </span>
                    <span className="text-sm text-gray-800 font-medium">
                      {attr.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
