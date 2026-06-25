"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
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
import { getMyProfile } from "@/services/user.service";
import { emailSchema, passwordSchema } from "@/lib/utils/validation";
import { AppDispatch, RootState } from "@/store";
import { setUser } from "@/store/slices/authSlice";
import { normalizeUser } from "@/lib/utils/normalizeUser";
import { getCart, addToCart } from "@/services/cart.service";
import { getWishlist } from "@/services/wishlist.service";
import { setWishlist } from "@/store/slices/wishlistSlice";
import { getMyNotifications } from "@/services/notification.service";
import { setNotifications } from "@/store/slices/notificationSlice";
import { clearCart, setItemsFromDB } from "@/store/slices/cartSlice";

const schema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const [loading, setLoading] = useState<boolean>(false);

  // Get local cart items from Redux
  const localCartItems = useSelector((state: RootState) => state.cart.items);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

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

      // 2. Fetch user profile
      const profileResponse = await getMyProfile();
      if (!profileResponse?.success) {
        toast.error("Failed to retrieve user profile", { id: toastId });
        return;
      }
      const reduxUser = normalizeUser(profileResponse as any);
      dispatch(setUser({ user: reduxUser }));

      // 3. Sync local cart items to database
      if (localCartItems.length > 0) {
        toast.loading("Syncing your cart...", { id: toastId });
        const syncPromises = localCartItems.map((item) => {
          const formData = new FormData();
          const payload = {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          };
          formData.append("data", JSON.stringify(payload));
          return addToCart(formData);
        });

        try {
          await Promise.all(syncPromises);
          toast.success("Cart synced successfully", { id: toastId });
          dispatch(clearCart());
        } catch (syncError) {
          console.error("Error syncing cart:", syncError);
          toast.warning(
            "Cart sync had issues, but we'll fetch your latest cart.",
          );
        }
      }

      // 4. Fetch updated cart from database
      const cart = await getCart();
      if (cart?.success && Array.isArray(cart.data?.items)) {
        dispatch(setItemsFromDB(cart.data.items));
      } else {
        // No cart items found, clear local cart
        dispatch(clearCart());
      }

      // 5. Fetch wishlist and notifications
      const wishlist: any = await getWishlist();
      const notifications = await getMyNotifications({});

      dispatch(setNotifications(notifications.data));
      const productIds = (wishlist.data?.items ?? []).map(
        (item: any) => item.productId,
      );
      dispatch(setWishlist(productIds));

      // 6. Redirect
      const redirectTo =
        redirect?.startsWith("/") &&
        redirect !== "/login" &&
        redirect !== "/register"
          ? redirect
          : "/";
      toast.success("Welcome back 👋", { id: toastId });
      router.push(redirectTo);
      router.refresh();
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

      <OAuthButtons redirect={redirect} />

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
