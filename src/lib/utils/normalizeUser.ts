/* eslint-disable @typescript-eslint/no-explicit-any */
import { IUser } from "@/store/slices/authSlice";

export interface vendorProfile {
  id: number;
  publicId: string;
  userId: number;
  storeName: string;
  slug: string;
  logo: any;
  banner: any;
  description: string;
  rating: string;
  totalSales: number;
  isVerified: boolean;
  verifiedById: any;
  isActive: boolean;
  returnPolicy: any;
  supportEmail: any;
  supportPhone: any;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  data: {
    id: number;
    publicId: string;
    email: string;
    phone: string;

    role: IUser["role"];

    isEmailVerified: boolean;
    isPhoneVerified: boolean;

    lastLoginAt: string | null;
    createdAt: string;

    accountInfo: {
      firstName: string;
      lastName: string;
      displayName: string | null;
      avatar: string | null;
      bio: string | null;
      dateOfBirth: string | null;
      gender: "MALE" | "FEMALE" | "OTHER" | null;
    } | null;

    addresses?: Array<{
      id: number;
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2: string | null;
      city_district: string;
      postalCode: string;
      country: string;
      landmark: string | null;
      latitude: string | null;
      longitude: string | null;
      isDefault: boolean;
    }>;

    vendorProfile?: vendorProfile; // Adjust this type based on your actual vendor profile structure

    notifications?: unknown[];
  };
}

export const normalizeUser = (profile: ProfileResponse): IUser => {
  const data = profile.data;
  // console.log(data);
  const defaultAddress =
    data.addresses?.find((address) => address.isDefault) ?? null;

  return {
    id: data.id,
    publicId: data.publicId,

    email: data.email,
    phone: data.phone,

    role: data.role,

    isEmailVerified: data.isEmailVerified,
    isPhoneVerified: data.isPhoneVerified,

    lastLoginAt: data.lastLoginAt,
    createdAt: data.createdAt,

    accountInfo: data.accountInfo,

    vendorProfile: data.vendorProfile,

    defaultAddress,

    notificationCount: data.notifications?.length ?? 0,
  };
};
