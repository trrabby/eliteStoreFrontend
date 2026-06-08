"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Camera,
  Lock,
  Pencil,
  Save,
  ShieldCheck,
  User,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/store/hook";
import { selectCurrentUser, setUser } from "@/store/slices/authSlice";

import { getMyProfile, updateMyProfile } from "@/services/user.service";

import { changePassword } from "@/services/auth.service";

import { normalizeUser } from "@/lib/utils/normalizeUser";
import { formatDate } from "@/lib/utils/date";

import { FormInput } from "@/components/shared/FormInput";
import Image from "next/image";

const profileSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  displayName: z.string().optional(),
  bio: z.string().max(160).optional(),

  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.string().optional(),
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

  const [isEditing, setIsEditing] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);

  const [savingPassword, setSavingPassword] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      bio: "",
    },
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    profileForm.reset({
      firstName: user?.accountInfo?.firstName ?? "",
      lastName: user?.accountInfo?.lastName ?? "",
      displayName: user?.accountInfo?.displayName ?? "",
      bio: user?.accountInfo?.bio ?? "",

      gender: user?.accountInfo?.gender ?? undefined,
      dateOfBirth: user?.accountInfo?.dateOfBirth
        ? user.accountInfo.dateOfBirth.slice(0, 10)
        : "",
    });
  }, [user, profileForm]);

  const formattedRole = user?.role
    ?.split("_")
    .map((r) => r.charAt(0).toUpperCase() + r.slice(1).toLowerCase())
    .join(" ");

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const isVendor = user?.role === "VENDOR";
  const hasVendorProfile = !!user?.vendorProfile;

  const avatar = avatarPreview ?? user?.accountInfo?.avatar ?? null;

  const initials = `${user?.accountInfo?.firstName?.[0] ?? ""}${
    user?.accountInfo?.lastName?.[0] ?? ""
  }`.toUpperCase();

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

      fd.append("data", JSON.stringify(data));

      if (avatarFile) {
        fd.append("image", avatarFile);
      }

      const res = await updateMyProfile(fd);

      if (!res?.success) {
        toast.error(res?.message ?? "Failed to update");
        return;
      }

      const profile = await getMyProfile();

      if (profile?.success) {
        dispatch(
          setUser({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            user: normalizeUser(profile as any),
          }),
        );
      }

      toast.success("Profile updated!");

      setIsEditing(false);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordData) => {
    setSavingPassword(true);
    if (data.currentPassword === data.newPassword) {
      setSavingPassword(false);
      return toast.error("You didn't change anything");
    }
    try {
      const res = await changePassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-3xl font-bold text-gray-900">
          My Profile
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage your account information and security.
        </p>
      </div>

      {/* Profile Card */}
      <div className="card overflow-hidden">
        {/* Top Banner */}
        <div className="h-28 bg-gradient-primary" />

        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="relative">
                <div
                  className="flex h-28 w-28 items-center justify-center
                             overflow-hidden rounded-full border-4 border-white
                             bg-white text-3xl font-bold text-primary shadow-lg"
                >
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt="avatar"
                      className="h-full w-full object-cover"
                      width={112}
                      height={112}
                    />
                  ) : (
                    initials
                  )}
                </div>

                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-lg cursor-pointer"
                    >
                      <Camera size={16} />
                    </button>

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </>
                )}
              </div>

              {/* User Info */}
              <div className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {user?.accountInfo?.firstName} {user?.accountInfo?.lastName}
                  </h3>

                  <span className="rounded-full bg-primary-pale px-3 py-1 text-xs font-semibold text-primary">
                    {formattedRole}
                  </span>

                  {user?.isEmailVerified && (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                      Verified
                    </span>
                  )}
                </div>

                {/* Bio */}
                <p className="mt-2 px-2 text-sm text-brand-500 text-shadow-2xs text-shadow-green-50 bg-white w-fit rounded-t-lg">
                  {user?.accountInfo?.bio || "No bio added yet."}
                </p>

                {/* Meta */}
                <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-500">
                  <p>
                    Joined{" "}
                    <span className="font-medium text-gray-700">
                      {user?.createdAt ? formatDate(user.createdAt) : "—"}
                    </span>
                  </p>

                  <p>
                    Last login{" "}
                    <span className="font-medium text-gray-700">
                      {user?.lastLoginAt ? formatDate(user.lastLoginAt) : "—"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 shrink-0 ">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm cursor-pointer"
                >
                  <Pencil size={15} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={profileForm.handleSubmit(onSaveProfile)}
                    disabled={savingProfile}
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm cursor-pointer"
                  >
                    {savingProfile ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                      />
                    ) : (
                      <Save size={15} />
                    )}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={savingProfile}
                    className="flex items-center gap-2 rounded-xl border border-primary
                               px-5 py-2.5 text-sm font-medium text-primary
                               transition-all hover:bg-primary hover:text-white cursor-pointer"
                  >
                    <X size={15} />
                    Cancel
                  </button>
                </div>
              )}

              <>
                {/* Admin Panel Button */}
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="flex items-center gap-2 rounded-xl border border-primary px-5 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary hover:text-white cursor-pointer">
                      <ShieldCheck size={15} />
                      Admin Panel
                    </button>
                  </Link>
                )}

                {/* Vendor Panel Button */}
                {(isVendor || (isAdmin && hasVendorProfile)) && (
                  <Link
                    href="/vendor/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="flex items-center gap-2 rounded-xl border border-primary px-5 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary hover:text-white cursor-pointer">
                      <ShieldCheck size={15} />
                      Vendor Panel
                    </button>
                  </Link>
                )}
              </>
            </div>
          </div>

          {/* Identity Section */}
          {/* Identity Section */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* LEFT */}
            <div className="space-y-5">
              {/* First Name */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">
                  First Name
                </p>

                {isEditing ? (
                  <FormInput
                    leftIcon={<User size={15} />}
                    error={profileForm.formState.errors.firstName?.message}
                    {...profileForm.register("firstName")}
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-900">
                    {user?.accountInfo?.firstName || "Not set"}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">Gender</p>

                {isEditing ? (
                  <select
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    {...profileForm.register("gender")}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                ) : (
                  <p className="text-base font-semibold text-gray-900">
                    {user?.accountInfo?.gender || "Not set"}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">
                  Email Address
                </p>

                <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <Mail size={16} className="text-primary" />
                  {user?.email}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-5">
              {/* Last Name */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">
                  Last Name
                </p>

                {isEditing ? (
                  <FormInput
                    error={profileForm.formState.errors.lastName?.message}
                    {...profileForm.register("lastName")}
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-900">
                    {user?.accountInfo?.lastName || "Not set"}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">
                  Date of Birth
                </p>

                {isEditing ? (
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    {...profileForm.register("dateOfBirth")}
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-900">
                    {user?.accountInfo?.dateOfBirth
                      ? new Date(user.accountInfo.dateOfBirth).toDateString()
                      : "Not set"}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">
                  Phone Number
                </p>

                <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <Phone size={16} className="text-primary" />
                  {user?.phone || "Not set"}
                </div>
              </div>
            </div>
          </div>

          {/* BIO SECTION — FULL WIDTH */}
          <div className="mt-8">
            <p className="mb-2 text-sm font-medium text-gray-500">Bio</p>

            {isEditing ? (
              <textarea
                rows={4}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Write something about yourself..."
                {...profileForm.register("bio")}
              />
            ) : (
              <p className="text-base leading-relaxed text-gray-700">
                {user?.accountInfo?.bio || "No bio added yet."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="card p-6">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Lock size={18} className="text-primary" />
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-60 cursor-pointer"
            >
              {savingPassword ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
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
