"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/shared/AuthCard";
import { FormInput } from "@/components/shared/FormInput";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { forgotPassword } from "@/services/auth.service";
import { emailSchema } from "@/lib/utils/validation";
import dynamic from "next/dynamic";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((m) => m.Player),
  { ssr: false },
);

const schema = z.object({ email: emailSchema });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await forgotPassword({ email: data.email });

      if (!result?.success) {
        toast.error(result?.message ?? "Failed to send reset email.");
        return;
      }

      setSentTo(data.email);
      setEmailSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthCard title="Check your inbox">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-4"
        >
          {/* Success Lottie */}
          <Player
            autoplay
            keepLastFrame
            src="https://assets9.lottiefiles.com/packages/lf20_jbrw3hcz.json"
            style={{ height: 150, width: 150 }}
          />

          <div>
            <p className="text-gray-700 font-medium">Reset link sent to:</p>
            <p className="text-primary font-bold text-lg mt-1">{sentTo}</p>
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              Check your inbox and click the link to reset your password. The
              link expires in 10 minutes.
            </p>
          </div>

          <Link href="/login" className="btn-secondary px-8 py-3 mt-2">
            Back to Login
          </Link>
        </motion.div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
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
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </MagneticButton>
      </form>

      <div className="flex justify-center mt-6">
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm text-gray-500
                     hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Login
        </Link>
      </div>
    </AuthCard>
  );
}
