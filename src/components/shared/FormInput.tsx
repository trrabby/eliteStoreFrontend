"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, leftIcon, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {props.required && <span className="text-primary ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className="absolute left-3.5 top-1/2 -translate-y-1/2
                            text-gray-400 pointer-events-none"
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={cn(
              "w-full rounded-xl border bg-white px-4 py-3 text-sm",
              "text-gray-900 placeholder:text-gray-400",
              "transition-all duration-200 outline-none",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary",
              error
                ? "border-red-400 focus:ring-red-100 focus:border-red-400"
                : "border-gray-200 hover:border-gray-300",
              leftIcon && "pl-10",
              isPassword && "pr-10",
              className,
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2
                         text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
          >
            <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
            {error}
          </motion.p>
        )}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
