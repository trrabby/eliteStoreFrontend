"use client";

import { useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export function MagneticButton({
  children,
  className,
  strength = 0.3,
  onClick,
  type = "button",
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    setPos({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={cn(className)}
    >
      {children}
    </motion.button>
  );
}
