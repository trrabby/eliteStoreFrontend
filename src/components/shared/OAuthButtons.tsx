"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { TbBrandGoogle } from "react-icons/tb";
import { FiGithub } from "react-icons/fi";

type OAuthButtonsProps = {
  redirect?: string | null;
};

export function OAuthButtons({ redirect }: OAuthButtonsProps) {
  const [loading, setLoading] = useState<"google" | "github" | null>(null);

  const handleOAuthLogin = async (provider: "google" | "github") => {
    if (loading) return;
    setLoading(provider);
    try {
      await signIn(provider, {
        callbackUrl: redirect || "/",
      });
    } catch (error) {
      console.error("OAuth signIn error:", error);
      toast.error("OAuth login failed. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-gray-400 font-medium">
            or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Google */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleOAuthLogin("google")}
          disabled={!!loading}
          className="flex items-center justify-center gap-2.5 px-4 py-3
                     rounded-xl border-2 border-gray-200 bg-white
                     hover:border-gray-300 hover:shadow-md
                     transition-all duration-200 text-sm font-medium
                     text-gray-700 disabled:opacity-60
                     disabled:cursor-not-allowed"
        >
          {loading === "google" ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full"
            />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <TbBrandGoogle className="w-5 h-5 text-gray-900" />
            </svg>
          )}
          Google
        </motion.button>

        {/* GitHub */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleOAuthLogin("github")}
          disabled={!!loading}
          className="flex items-center justify-center gap-2.5 px-4 py-3
                     rounded-xl border-2 border-gray-200 bg-white
                     hover:border-gray-300 hover:shadow-md
                     transition-all duration-200 text-sm font-medium
                     text-gray-700 disabled:opacity-60
                     disabled:cursor-not-allowed"
        >
          {loading === "github" ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full"
            />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-gray-900"
              aria-hidden="true"
            >
              <FiGithub className="w-5 h-5 text-gray-900" />
            </svg>
          )}
          GitHub
        </motion.button>
      </div>
    </div>
  );
}
