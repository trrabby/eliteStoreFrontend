"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {/* Card */}
      <div
        className="bg-white rounded-3xl shadow-pink p-7 md:p-8
                      border border-primary-pale/60"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        {/* Title */}
        <div className="text-center mb-7">
          <h1 className="font-display text-2xl font-bold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1.5">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </motion.div>
  );
}
