"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  centered?: boolean;
  className?: string;
};

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "View All",
  centered = false,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-end justify-between mb-6",
        centered && "flex-col items-center text-center gap-2",
        className,
      )}
    >
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="section-title"
        >
          {title}
          {/* pink underline accent */}
          <span
            className="block mt-1 w-12 h-1 rounded-full
                           bg-gradient-primary"
          />
        </motion.h2>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm text-gray-500 mt-2"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {href && !centered && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Link
            href={href}
            className="flex items-center gap-1.5 text-sm font-medium
                       text-primary hover:gap-2.5 transition-all duration-200
                       group"
          >
            {linkLabel}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
