"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  { label: "Address", href: "/checkout" },
  { label: "Review", href: "/checkout/review" },
  { label: "Payment", href: "/checkout/payment" },
];

export function CheckoutProgress() {
  const pathname = usePathname();

  const currentStep = STEPS.findIndex((s) => pathname === s.href);

  return (
    <div className="flex items-center justify-center gap-0 py-6">
      {STEPS.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;

        return (
          <div key={step.href} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center",
                  "text-sm font-bold transition-all duration-300",
                  isDone
                    ? "bg-primary text-white"
                    : isActive
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-gray-100 text-gray-400",
                )}
              >
                {isDone ? <Check size={16} /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  isActive
                    ? "text-primary"
                    : isDone
                    ? "text-gray-600"
                    : "text-gray-400",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div
                className="w-16 md:w-24 h-0.5 mx-2 mb-5 rounded-full overflow-hidden
                              bg-gray-200"
              >
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: i < currentStep ? "100%" : "0%" }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
