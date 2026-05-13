/* eslint-disable @typescript-eslint/no-explicit-any */
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "CUSTOMER" | "VENDOR";

export interface IAccountInfo {
  firstName: string;
  lastName: string;
  displayName: string | null;
  avatar: string | null;
}

export interface IAddress {
  id: number;

  userId?: number;

  type?: "HOME" | "OFFICE" | "OTHER";

  label?: string;

  fullName: string;

  phone: string;

  addressLine1: string;

  addressLine2: string | null;

  city_district: string;

  postalCode: string;

  country: string;

  isDefault?: boolean;

  landmark: string | null;

  latitude: string | null;

  longitude: string | null;

  createdAt?: string;

  updatedAt?: string;
}

export interface IUser {
  id: number;

  publicId: string;

  email: string;

  phone: string;

  role: UserRole;

  isEmailVerified: boolean;

  isPhoneVerified: boolean;

  lastLoginAt: string | null;

  createdAt: string;

  accountInfo: IAccountInfo | null;

  addresses?: IAddress[];

  notifications?: unknown[];

  // redux derived state
  defaultAddress: IAddress | null;

  notificationCount: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  phone: number;
  firstName: string;
  lastName: string;
}

export interface IUserResponse {
  accountInfo: AccountInfo;
  addresses: Address[];
  notifications: Notification[];
  couponsUsed: any[];
  orderStatusUpdates: any[];
  cart: any;
  orders: any[];
  searchHistory: any[];
  returnRequests: any[];
  reviews: any[];
  role: string;
  email: string;
  phone: string;
  publicId: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  vendorProfile: any;
  wallet: any;
  wishlist: any;
}

export interface AccountInfo {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  displayName: any;
  avatar: any;
  bio: any;
  gender: any;
  dateOfBirth: any;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city_district: string;
  country: string;
  postalCode: string;
  landmark: string;
  latitude: string;
  longitude: string;
  type: string;
  label: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string;
  link: string;
  isRead: boolean;
  createdAt?: string;
}
