"use client";

/* eslint-disable react/no-unescaped-entities */

import { useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { useDispatch } from "react-redux";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { motion, AnimatePresence } from "framer-motion";

import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

import { toast } from "sonner";

import { AuthCard } from "@/components/shared/AuthCard";

import { FormInput } from "@/components/shared/FormInput";

import { OAuthButtons } from "@/components/shared/OAuthButtons";

import { MagneticButton } from "@/components/shared/MagneticButton";

import { cn } from "@/lib/utils/cn";

import {
  emailSchema,
  passwordSchema,
  phoneSchema,
} from "@/lib/utils/validation";

import { registerUser } from "@/services/user.service";

import { loginUser } from "@/services/auth.service";

import { getMyProfile } from "@/services/user.service";

import type { IUser, RegisterPayload } from "@/types/user.types";
import { AppDispatch } from "@/store";
import { setUser } from "@/store/slices/authSlice";

// ============================
// Validation Schemas
// ============================

const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),

  lastName: z.string().min(1, "Last name is required"),

  phone: phoneSchema,
});

const step2Schema = z
  .object({
    email: emailSchema,

    password: passwordSchema,

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",

    path: ["confirmPassword"],
  });

type Step1Data = z.infer<typeof step1Schema>;

type Step2Data = z.infer<typeof step2Schema>;

// ============================
// Step Indicator
// ============================

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-7">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center gap-3">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              "text-sm font-bold transition-all duration-300",

              s < step
                ? "bg-primary text-white"
                : s === step
                  ? "bg-primary text-white ring-4 ring-primary/20"
                  : "bg-gray-100 text-gray-400",
            )}
          >
            {s < step ? <Check size={14} /> : s}
          </div>

          {s < 2 && (
            <div
              className={cn(
                "w-12 h-0.5 rounded-full transition-all duration-500",

                s < step ? "bg-primary" : "bg-gray-200",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================
// Component
// ============================

export default function RegisterPage() {
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();

  const [step, setStep] = useState<number>(1);

  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  // ============================
  // Step 1 Form
  // ============================

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  });

  // ============================
  // Step 2 Form
  // ============================

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  });

  // ============================
  // Step 1 Submit
  // ============================

  const onStep1Submit = (data: Step1Data) => {
    setStep1Data(data);

    setStep(2);
  };

  // ============================
  // Step 2 Submit
  // ============================

  const onStep2Submit = async (data: Step2Data) => {
    if (!step1Data) return;

    setLoading(true);

    try {
      // register payload
      const payload: RegisterPayload = {
        firstName: step1Data.firstName,

        lastName: step1Data.lastName,

        phone: Number(step1Data.phone),

        email: data.email,

        password: data.password,
      };

      // register
      const registerResponse = await registerUser(payload);

      if (!registerResponse.success) {
        toast.error(registerResponse.message ?? "Registration failed");

        return;
      }

      // auto login
      const loginResponse = await loginUser({
        email: data.email,

        password: data.password,
      });

      if (!loginResponse.success) {
        toast.error("Account created but auto-login failed");

        router.push("/login");

        return;
      }

      // fetch profile
      const profileResponse = await getMyProfile();

      if (!profileResponse.success) {
        toast.error("Failed to retrieve profile");

        return;
      }

      const profile = profileResponse.data;

      // normalize redux user
      // const reduxUser: IUser = {
      //   ...profile,

      //   addresses: profile.addresses ?? [],

      //   notifications: profile.notifications ?? [],

      //   defaultAddress:
      //     profile.addresses?.find((address) => address.isDefault) ?? null,

      //   notificationCount: profile.notifications?.length ?? 0,
      // };

      // // hydrate redux
      // dispatch(
      //   setUser({
      //     user: reduxUser,
      //   }),
      // );

      toast.success("Account created successfully 🎉");

      router.push("/");

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Animations
  // ============================

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,

      opacity: 0,
    }),

    center: {
      x: 0,

      opacity: 1,

      transition: {
        duration: 0.35,
      },
    },

    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,

      opacity: 0,

      transition: {
        duration: 0.25,
      },
    }),
  };

  // ============================
  // Render
  // ============================

  return (
    <AuthCard
      title="Create account"
      subtitle="Join Elite Store and feel the elegance"
    >
      <StepIndicator step={step} />

      <AnimatePresence mode="wait" custom={step === 2 ? 1 : -1}>
        {step === 1 ? (
          <motion.div
            key="step1"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <form
              onSubmit={form1.handleSubmit(onStep1Submit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="First name"
                  placeholder="Rahim"
                  autoComplete="given-name"
                  leftIcon={<User size={16} />}
                  error={form1.formState.errors.firstName?.message}
                  required
                  {...form1.register("firstName")}
                />

                <FormInput
                  label="Last name"
                  placeholder="Uddin"
                  autoComplete="family-name"
                  error={form1.formState.errors.lastName?.message}
                  required
                  {...form1.register("lastName")}
                />
              </div>

              <FormInput
                label="Phone number"
                type="tel"
                placeholder="01XXXXXXXXX"
                autoComplete="tel"
                leftIcon={<Phone size={16} />}
                error={form1.formState.errors.phone?.message}
                required
                {...form1.register("phone")}
              />

              <MagneticButton
                type="submit"
                strength={0.25}
                className="w-full btn-primary py-3.5 mt-2
                           flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight size={16} />
              </MagneticButton>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <form
              onSubmit={form2.handleSubmit(onStep2Submit)}
              className="space-y-4"
            >
              <FormInput
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                leftIcon={<Mail size={16} />}
                error={form2.formState.errors.email?.message}
                required
                {...form2.register("email")}
              />

              <FormInput
                label="Password"
                type="password"
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                leftIcon={<Lock size={16} />}
                error={form2.formState.errors.password?.message}
                required
                {...form2.register("password")}
              />

              <FormInput
                label="Confirm password"
                type="password"
                placeholder="Repeat your password"
                autoComplete="new-password"
                leftIcon={<Lock size={16} />}
                error={form2.formState.errors.confirmPassword?.message}
                required
                {...form2.register("confirmPassword")}
              />

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                By creating an account you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5
                             px-4 py-3.5 rounded-xl
                             border-2 border-gray-200
                             text-sm font-medium text-gray-600
                             hover:border-gray-300
                             transition-all"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <MagneticButton
                  type="submit"
                  disabled={loading}
                  strength={0.25}
                  className="flex-1 btn-primary py-3.5
                             flex items-center justify-center
                             gap-2 disabled:opacity-60
                             disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{
                          rotate: 360,
                        }}
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
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={16} />
                    </>
                  )}
                </MagneticButton>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <OAuthButtons />

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
