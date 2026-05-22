"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Camera, Save, Lock, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { selectCurrentUser, setUser } from "@/store/slices/authSlice";
import { updateMyProfile, getMyProfile } from "@/services/user.service";
import { changePassword } from "@/services/auth.service";
import { normalizeUser } from "@/lib/utils/normalizeUser";
import { FormInput } from "@/components/shared/FormInput";
import { formatDate } from "@/lib/utils/date";

const profileSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  displayName: z.string().optional(),
  bio: z.string().max(160).optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const fileRef = useRef<HTMLInputElement>(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.accountInfo?.firstName ?? "",
      lastName: user?.accountInfo?.lastName ?? "",
      displayName: user?.accountInfo?.displayName ?? "",
    },
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSaveProfile = async (data: ProfileData) => {
    setSavingProfile(true);
    try {
      const fd = new FormData();
      const payload = { ...data };
      fd.append("data", JSON.stringify(payload));
      if (avatarFile) fd.append("avatar", avatarFile);

      const res = await updateMyProfile(fd);
      if (!res?.success) {
        toast.error(res?.message ?? "Failed to update");
        return;
      }

      // refresh redux
      const profile = await getMyProfile();
      if (profile?.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispatch(setUser({ user: normalizeUser(profile as any) }));
      }
      toast.success("Profile updated!");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordData) => {
    setSavingPassword(true);
    try {
      const fd = new FormData();
      fd.append(
        "data",
        JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      );
      const res = await changePassword(fd);
      if (!res?.success) {
        toast.error(res?.message ?? "Failed");
        return;
      }
      toast.success("Password changed!");
      passwordForm.reset();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSavingPassword(false);
    }
  };

  const avatar = avatarPreview ?? user?.accountInfo?.avatar;
  const initials =
    `${user?.accountInfo?.firstName?.[0] ?? ""}${user?.accountInfo?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-gray-900">
        My Profile
      </h2>

      {/* Avatar + basic info card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full
                         flex items-center justify-center text-white shadow-pink
                         hover:brightness-110 transition-all"
            >
              <Camera size={13} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {user?.accountInfo?.firstName} {user?.accountInfo?.lastName}
            </h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-primary-pale text-primary px-2.5 py-0.5 rounded-full font-medium capitalize">
                {user?.role?.toLowerCase().replace("_", " ")}
              </span>
              {user?.isEmailVerified && (
                <span className="text-xs bg-green-50 text-green-600 px-2.5 py-0.5 rounded-full font-medium">
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="sm:ml-auto text-sm text-gray-400 space-y-1">
            <p>
              Member since {user?.createdAt ? formatDate(user.createdAt) : "—"}
            </p>
            {user?.lastLoginAt && (
              <p>Last login {formatDate(user.lastLoginAt)}</p>
            )}
          </div>
        </div>

        {/* Profile form */}
        <form
          onSubmit={profileForm.handleSubmit(onSaveProfile)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              leftIcon={<User size={15} />}
              error={profileForm.formState.errors.firstName?.message}
              {...profileForm.register("firstName")}
            />
            <FormInput
              label="Last Name"
              error={profileForm.formState.errors.lastName?.message}
              {...profileForm.register("lastName")}
            />
          </div>

          <FormInput
            label="Display Name (optional)"
            placeholder="How should we call you?"
            {...profileForm.register("displayName")}
          />

          {/* Read-only fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
                <Mail size={15} className="text-gray-400" />
                {user?.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
                <Phone size={15} className="text-gray-400" />
                {user?.phone ?? "Not set"}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm disabled:opacity-60"
            >
              {savingProfile ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <Save size={15} />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock size={16} className="text-primary" />
          Change Password
        </h3>

        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          className="space-y-4"
        >
          <FormInput
            label="Current Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock size={15} />}
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register("currentPassword")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="New Password"
              type="password"
              placeholder="Min 6 characters"
              leftIcon={<Lock size={15} />}
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register("newPassword")}
            />
            <FormInput
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              leftIcon={<Lock size={15} />}
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register("confirmPassword")}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm disabled:opacity-60"
            >
              {savingPassword ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <Lock size={15} />
              )}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
