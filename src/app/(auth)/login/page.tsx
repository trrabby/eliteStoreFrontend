/* eslint-disable react-hooks/exhaustive-deps */
"use client";

/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCard } from "@/components/shared/AuthCard";
import { FormInput } from "@/components/shared/FormInput";
import { OAuthButtons } from "@/components/shared/OAuthButtons";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { loginUser } from "@/services/auth.service";
import { emailSchema, passwordSchema } from "@/lib/utils/validation";
import { useUserSync } from "@/lib/hooks/useUserSync";

const schema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

type FormData = z.infer<typeof schema>;

// ─── SearchParams Handler ─────────────────────────────────────────
function SearchParamsHandler({
  onRedirect,
}: {
  onRedirect: (path: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    // Show toast only when redirect is a non-null string that is NOT a public page
    if (
      redirect &&
      redirect !== "/" &&
      redirect !== "/login" &&
      redirect !== "/register"
    ) {
      toast.info("Please login to continue");
    }
    onRedirect(redirect || "/");
  }, [onRedirect]);

  return null;
}

// ─── Main Component ──────────────────────────────────────────────
export default function LoginPage() {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // In LoginPage
  const { syncUser } = useUserSync();

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    const toastId = toast.loading("Signing in...");
    try {
      // 1. Login
      const loginResponse = await loginUser(values);
      if (!loginResponse?.success) {
        toast.error(loginResponse?.message ?? "Login failed", { id: toastId });
        return;
      }

      // 2. Sync user data (profile, cart, wishlist, etc.)
      await syncUser(redirectPath);
      toast.success("Enjoy your shopping!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your Elite Store account"
    >
      {/* ─── SearchParams handler ─── */}
      <Suspense fallback={null}>
        <SearchParamsHandler onRedirect={setRedirectPath} />
      </Suspense>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          required
          {...register("email")}
        />

        <div>
          <FormInput
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            leftIcon={<Lock size={16} />}
            error={errors.password?.message}
            required
            {...register("password")}
          />

          <div className="flex justify-end mt-2">
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <MagneticButton
          type="submit"
          disabled={loading}
          strength={0.25}
          className="w-full btn-primary py-3.5 mt-2
                     flex items-center justify-center gap-2
                     disabled:opacity-60
                     disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-5 h-5 border-2
                           border-white/30
                           border-t-white
                           rounded-full"
              />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight size={16} />
            </>
          )}
        </MagneticButton>
      </form>

      {/* OAuthButtons receives the redirect path */}
      <OAuthButtons redirect={redirectPath} />

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-primary font-semibold hover:underline"
        >
          Create one free
        </Link>
      </p>
    </AuthCard>
  );
}
