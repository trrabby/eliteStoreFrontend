"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type ProductDetailTabsProps = {
  description: string | null;
  attributes: { name: string; value: string }[];
};

const TABS = [
  { id: "description", label: "Description" },
  { id: "specs", label: "Specifications" },
];

export function ProductDetailTabs({
  description,
  attributes,
}: ProductDetailTabsProps) {
  const [active, setActive] = useState("description");

  return (
    <div className="mb-8">
      {/* Tab buttons */}
      <div className="flex gap-1 border-b border-gray-100 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "relative px-5 py-3 text-sm font-medium transition-colors",
              active === tab.id
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {tab.label}
            {active === tab.id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5
                           bg-gradient-primary rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {active === "description" && (
          <motion.div
            key="description"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="prose prose-sm max-w-none text-gray-600
                       leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: description ?? "<p>No description available.</p>",
            }}
          />
        )}

        {active === "specs" && (
          <motion.div
            key="specs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {attributes.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No specifications available.
              </p>
            ) : (
              <div
                className="divide-y divide-gray-100 rounded-2xl
                              border border-gray-100 overflow-hidden"
              >
                {attributes.map((attr, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 px-5 py-3
                               hover:bg-gray-50 transition-colors"
                  >
                    <span
                      className="text-sm text-gray-500 font-medium
                                     w-36 flex-shrink-0"
                    >
                      {attr.name}
                    </span>
                    <span className="text-sm text-gray-900">{attr.value}</span>
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
