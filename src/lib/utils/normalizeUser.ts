import { IUser } from "@/store/slices/authSlice";

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

    defaultAddress,

    notificationCount: data.notifications?.length ?? 0,
  };
};
