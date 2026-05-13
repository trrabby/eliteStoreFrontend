"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/shared/AuthCard";
import { FormInput } from "@/components/shared/FormInput";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { resetPassword } from "@/services/auth.service";
import { passwordSchema } from "@/lib/utils/validation";
import dynamic from "next/dynamic";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((m) => m.Player),
  { ssr: false },
);

const schema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Guard — token must be present
  if (!token || !email) {
    return (
      <AuthCard title="Invalid link">
        <div className="text-center space-y-4">
          <p className="text-gray-500 text-sm">
            This reset link is invalid or has expired.
          </p>
          <Link href="/forgot-password" className="btn-primary px-8 py-3">
            Request New Link
          </Link>
        </div>
      </AuthCard>
    );
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await resetPassword({
        token,
        email,
        newPassword: data.newPassword,
      });

      if (!result?.success) {
        toast.error(result?.message ?? "Reset failed. Link may have expired.");
        return;
      }

      setSuccess(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthCard title="Password reset!">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-4"
        >
          <Player
            autoplay
            keepLastFrame
            src="https://assets9.lottiefiles.com/packages/lf20_jbrw3hcz.json"
            style={{ height: 150, width: 150 }}
          />
          <div>
            <p className="text-gray-700 font-medium">
              Your password has been reset successfully.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              You can now sign in with your new password.
            </p>
          </div>
          <MagneticButton
            strength={0.25}
            onClick={() => router.push("/login")}
            className="btn-primary px-8 py-3 flex items-center gap-2"
          >
            Sign In
            <ArrowRight size={16} />
          </MagneticButton>
        </motion.div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Choose a strong new password"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="New password"
          type="password"
          placeholder="Min. 6 characters"
          autoComplete="new-password"
          leftIcon={<Lock size={16} />}
          error={errors.newPassword?.message}
          required
          {...register("newPassword")}
        />

        <FormInput
          label="Confirm new password"
          type="password"
          placeholder="Repeat new password"
          autoComplete="new-password"
          leftIcon={<Lock size={16} />}
          error={errors.confirmPassword?.message}
          required
          {...register("confirmPassword")}
        />

        <MagneticButton
          type="submit"
          disabled={loading}
          strength={0.25}
          className="w-full btn-primary py-3.5 mt-2 flex items-center
                     justify-center gap-2 disabled:opacity-60
                     disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30
                           border-t-white rounded-full"
              />
              Resetting...
            </>
          ) : (
            <>
              Reset Password
              <ArrowRight size={16} />
            </>
          )}
        </MagneticButton>
      </form>

      <div className="flex justify-center mt-6">
        <Link
          href="/login"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </AuthCard>
  );
}
