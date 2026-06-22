/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Ban,
  Filter,
  Calendar,
  X,
  ChevronDown,
  Eye,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Star,
  Wallet,
  Tag,
  Store,
  UserCog,
} from "lucide-react";
import {
  getAllUsers,
  toggleUserStatus,
  makeAdmin,
} from "@/services/user.service";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Link from "next/link";

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "bg-red-50 text-red-700",
  ADMIN: "bg-purple-50 text-purple-700",
  VENDOR: "bg-amber-50 text-amber-700",
  CUSTOMER: "bg-blue-50 text-blue-700",
};

const ROLE_TABS = ["ALL", "CUSTOMER", "VENDOR", "ADMIN", "SUPER_ADMIN"];
const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
];
const VERIFICATION_OPTIONS = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
];
const GENDER_OPTIONS = [
  { value: "", label: "Any" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];
const ORDER_STATUS_OPTIONS = [
  { value: "", label: "Any" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RETURN_REQUESTED", label: "Return Requested" },
  { value: "RETURNED", label: "Returned" },
  { value: "REFUNDED", label: "Refunded" },
];
const RETURN_STATUS_OPTIONS = [
  { value: "", label: "Any" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "COMPLETED", label: "Completed" },
];
const SORT_BY_OPTIONS = [
  { value: "createdAt", label: "Joined Date" },
  { value: "lastLoginAt", label: "Last Login" },
  { value: "email", label: "Email" },
  { value: "role", label: "Role" },
  { value: "displayName", label: "Display Name" },
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 15;

  // --- Filter state ---
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("all");
  const [verification, setVerification] = useState("all");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [createdAtFrom, setCreatedAtFrom] = useState("");
  const [createdAtTo, setCreatedAtTo] = useState("");
  const [lastLoginFrom, setLastLoginFrom] = useState("");
  const [lastLoginTo, setLastLoginTo] = useState("");

  // Account info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [dobFrom, setDobFrom] = useState("");
  const [dobTo, setDobTo] = useState("");

  // Address
  const [addressCityDistrict, setAddressCityDistrict] = useState("");
  const [addressCountry, setAddressCountry] = useState("");
  const [addressPostalCode, setAddressPostalCode] = useState("");
  const [addressType, setAddressType] = useState("");
  const [addressIsDefault, setAddressIsDefault] = useState("");

  // Orders
  const [orderCountMin, setOrderCountMin] = useState("");
  const [orderCountMax, setOrderCountMax] = useState("");
  const [orderTotalSpentMin, setOrderTotalSpentMin] = useState("");
  const [orderTotalSpentMax, setOrderTotalSpentMax] = useState("");
  const [hasDeliveredOrders, setHasDeliveredOrders] = useState("");
  const [hasCancelledOrders, setHasCancelledOrders] = useState("");
  const [hasReturnedOrders, setHasReturnedOrders] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [returnRequestStatus, setReturnRequestStatus] = useState("");
  const [returnRequestCountMin, setReturnRequestCountMin] = useState("");
  const [returnRequestCountMax, setReturnRequestCountMax] = useState("");

  // Products
  const [productInCart, setProductInCart] = useState("");
  const [productInWishlist, setProductInWishlist] = useState("");
  const [orderedProduct, setOrderedProduct] = useState("");
  const [reviewedProduct, setReviewedProduct] = useState("");

  // Vendor
  const [isVendor, setIsVendor] = useState("");
  const [vendorVerified, setVendorVerified] = useState("");
  const [vendorStoreName, setVendorStoreName] = useState("");
  const [vendorRatingMin, setVendorRatingMin] = useState("");
  const [vendorRatingMax, setVendorRatingMax] = useState("");
  const [vendorTotalSalesMin, setVendorTotalSalesMin] = useState("");
  const [vendorTotalSalesMax, setVendorTotalSalesMax] = useState("");

  // Coupon
  const [usedCouponCode, setUsedCouponCode] = useState("");
  const [usedCouponId, setUsedCouponId] = useState("");

  // Review
  const [hasWrittenReviews, setHasWrittenReviews] = useState("");
  const [reviewRatingMin, setReviewRatingMin] = useState("");
  const [reviewRatingMax, setReviewRatingMax] = useState("");
  const [reviewCountMin, setReviewCountMin] = useState("");
  const [reviewCountMax, setReviewCountMax] = useState("");

  // Wallet
  const [walletBalanceMin, setWalletBalanceMin] = useState("");
  const [walletBalanceMax, setWalletBalanceMax] = useState("");

  // Session
  const [hasActiveSession, setHasActiveSession] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // UI
  const [showFilters, setShowFilters] = useState(false);
  const [filterCount, setFilterCount] = useState(0);

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (search) count++;
    if (role !== "ALL") count++;
    if (status !== "all") count++;
    if (verification !== "all") count++;
    if (createdAtFrom) count++;
    if (createdAtTo) count++;
    if (lastLoginFrom) count++;
    if (lastLoginTo) count++;
    if (firstName) count++;
    if (lastName) count++;
    if (displayName) count++;
    if (gender) count++;
    if (ageMin) count++;
    if (ageMax) count++;
    if (dobFrom) count++;
    if (dobTo) count++;
    if (addressCityDistrict) count++;
    if (addressCountry) count++;
    if (addressPostalCode) count++;
    if (addressType) count++;
    if (addressIsDefault) count++;
    if (orderCountMin) count++;
    if (orderCountMax) count++;
    if (orderTotalSpentMin) count++;
    if (orderTotalSpentMax) count++;
    if (hasDeliveredOrders) count++;
    if (hasCancelledOrders) count++;
    if (hasReturnedOrders) count++;
    if (orderStatus) count++;
    if (returnRequestStatus) count++;
    if (returnRequestCountMin) count++;
    if (returnRequestCountMax) count++;
    if (productInCart) count++;
    if (productInWishlist) count++;
    if (orderedProduct) count++;
    if (reviewedProduct) count++;
    if (isVendor) count++;
    if (vendorVerified) count++;
    if (vendorStoreName) count++;
    if (vendorRatingMin) count++;
    if (vendorRatingMax) count++;
    if (vendorTotalSalesMin) count++;
    if (vendorTotalSalesMax) count++;
    if (usedCouponCode) count++;
    if (usedCouponId) count++;
    if (hasWrittenReviews) count++;
    if (reviewRatingMin) count++;
    if (reviewRatingMax) count++;
    if (reviewCountMin) count++;
    if (reviewCountMax) count++;
    if (walletBalanceMin) count++;
    if (walletBalanceMax) count++;
    if (hasActiveSession) count++;
    if (sortBy !== "createdAt") count++;
    if (sortOrder !== "desc") count++;
    return count;
  };

  const clearFilters = () => {
    setSearch("");
    setRole("ALL");
    setStatus("all");
    setVerification("all");
    setCreatedAtFrom("");
    setCreatedAtTo("");
    setLastLoginFrom("");
    setLastLoginTo("");
    setFirstName("");
    setLastName("");
    setDisplayName("");
    setGender("");
    setAgeMin("");
    setAgeMax("");
    setDobFrom("");
    setDobTo("");
    setAddressCityDistrict("");
    setAddressCountry("");
    setAddressPostalCode("");
    setAddressType("");
    setAddressIsDefault("");
    setOrderCountMin("");
    setOrderCountMax("");
    setOrderTotalSpentMin("");
    setOrderTotalSpentMax("");
    setHasDeliveredOrders("");
    setHasCancelledOrders("");
    setHasReturnedOrders("");
    setOrderStatus("");
    setReturnRequestStatus("");
    setReturnRequestCountMin("");
    setReturnRequestCountMax("");
    setProductInCart("");
    setProductInWishlist("");
    setOrderedProduct("");
    setReviewedProduct("");
    setIsVendor("");
    setVendorVerified("");
    setVendorStoreName("");
    setVendorRatingMin("");
    setVendorRatingMax("");
    setVendorTotalSalesMin("");
    setVendorTotalSalesMax("");
    setUsedCouponCode("");
    setUsedCouponId("");
    setHasWrittenReviews("");
    setReviewRatingMin("");
    setReviewRatingMax("");
    setReviewCountMin("");
    setReviewCountMax("");
    setWalletBalanceMin("");
    setWalletBalanceMax("");
    setHasActiveSession("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  // Load users with current filters
  const load = async () => {
    setLoading(true);
    const params: any = {
      page,
      limit,
      search: search || undefined,
      role: role === "ALL" ? undefined : role,
      status: status === "all" ? undefined : status,
      verification: verification === "all" ? undefined : verification,
      createdAtFrom: createdAtFrom || undefined,
      createdAtTo: createdAtTo || undefined,
      lastLoginFrom: lastLoginFrom || undefined,
      lastLoginTo: lastLoginTo || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      displayName: displayName || undefined,
      gender: gender || undefined,
      ageMin: ageMin ? Number(ageMin) : undefined,
      ageMax: ageMax ? Number(ageMax) : undefined,
      dobFrom: dobFrom || undefined,
      dobTo: dobTo || undefined,
      addressCityDistrict: addressCityDistrict || undefined,
      addressCountry: addressCountry || undefined,
      addressPostalCode: addressPostalCode || undefined,
      addressType: addressType || undefined,
      addressIsDefault:
        addressIsDefault === "true"
          ? true
          : addressIsDefault === "false"
          ? false
          : undefined,
      orderCountMin: orderCountMin ? Number(orderCountMin) : undefined,
      orderCountMax: orderCountMax ? Number(orderCountMax) : undefined,
      orderTotalSpentMin: orderTotalSpentMin
        ? Number(orderTotalSpentMin)
        : undefined,
      orderTotalSpentMax: orderTotalSpentMax
        ? Number(orderTotalSpentMax)
        : undefined,
      hasDeliveredOrders:
        hasDeliveredOrders === "true"
          ? true
          : hasDeliveredOrders === "false"
          ? false
          : undefined,
      hasCancelledOrders:
        hasCancelledOrders === "true"
          ? true
          : hasCancelledOrders === "false"
          ? false
          : undefined,
      hasReturnedOrders:
        hasReturnedOrders === "true"
          ? true
          : hasReturnedOrders === "false"
          ? false
          : undefined,
      orderStatus: orderStatus || undefined,
      returnRequestStatus: returnRequestStatus || undefined,
      returnRequestCountMin: returnRequestCountMin
        ? Number(returnRequestCountMin)
        : undefined,
      returnRequestCountMax: returnRequestCountMax
        ? Number(returnRequestCountMax)
        : undefined,
      productInCart: productInCart || undefined,
      productInWishlist: productInWishlist || undefined,
      orderedProduct: orderedProduct || undefined,
      reviewedProduct: reviewedProduct || undefined,
      isVendor:
        isVendor === "true" ? true : isVendor === "false" ? false : undefined,
      vendorVerified:
        vendorVerified === "true"
          ? true
          : vendorVerified === "false"
          ? false
          : undefined,
      vendorStoreName: vendorStoreName || undefined,
      vendorRatingMin: vendorRatingMin ? Number(vendorRatingMin) : undefined,
      vendorRatingMax: vendorRatingMax ? Number(vendorRatingMax) : undefined,
      vendorTotalSalesMin: vendorTotalSalesMin
        ? Number(vendorTotalSalesMin)
        : undefined,
      vendorTotalSalesMax: vendorTotalSalesMax
        ? Number(vendorTotalSalesMax)
        : undefined,
      usedCouponCode: usedCouponCode || undefined,
      usedCouponId: usedCouponId ? Number(usedCouponId) : undefined,
      hasWrittenReviews:
        hasWrittenReviews === "true"
          ? true
          : hasWrittenReviews === "false"
          ? false
          : undefined,
      reviewRatingMin: reviewRatingMin ? Number(reviewRatingMin) : undefined,
      reviewRatingMax: reviewRatingMax ? Number(reviewRatingMax) : undefined,
      reviewCountMin: reviewCountMin ? Number(reviewCountMin) : undefined,
      reviewCountMax: reviewCountMax ? Number(reviewCountMax) : undefined,
      walletBalanceMin: walletBalanceMin ? Number(walletBalanceMin) : undefined,
      walletBalanceMax: walletBalanceMax ? Number(walletBalanceMax) : undefined,
      hasActiveSession:
        hasActiveSession === "true"
          ? true
          : hasActiveSession === "false"
          ? false
          : undefined,
      sortBy,
      sortOrder,
    };
    const res = await getAllUsers(params);
    if (res?.success) {
      setUsers(res.data?.users ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [
    page,
    role,
    status,
    verification,
    createdAtFrom,
    createdAtTo,
    lastLoginFrom,
    lastLoginTo,
    firstName,
    lastName,
    displayName,
    gender,
    ageMin,
    ageMax,
    dobFrom,
    dobTo,
    addressCityDistrict,
    addressCountry,
    addressPostalCode,
    addressType,
    addressIsDefault,
    orderCountMin,
    orderCountMax,
    orderTotalSpentMin,
    orderTotalSpentMax,
    hasDeliveredOrders,
    hasCancelledOrders,
    hasReturnedOrders,
    orderStatus,
    returnRequestStatus,
    returnRequestCountMin,
    returnRequestCountMax,
    productInCart,
    productInWishlist,
    orderedProduct,
    reviewedProduct,
    isVendor,
    vendorVerified,
    vendorStoreName,
    vendorRatingMin,
    vendorRatingMax,
    vendorTotalSalesMin,
    vendorTotalSalesMax,
    usedCouponCode,
    usedCouponId,
    hasWrittenReviews,
    reviewRatingMin,
    reviewRatingMax,
    reviewCountMin,
    reviewCountMax,
    walletBalanceMin,
    walletBalanceMax,
    hasActiveSession,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    setFilterCount(countActiveFilters());
  }, [
    search,
    role,
    status,
    verification,
    createdAtFrom,
    createdAtTo,
    lastLoginFrom,
    lastLoginTo,
    firstName,
    lastName,
    displayName,
    gender,
    ageMin,
    ageMax,
    dobFrom,
    dobTo,
    addressCityDistrict,
    addressCountry,
    addressPostalCode,
    addressType,
    addressIsDefault,
    orderCountMin,
    orderCountMax,
    orderTotalSpentMin,
    orderTotalSpentMax,
    hasDeliveredOrders,
    hasCancelledOrders,
    hasReturnedOrders,
    orderStatus,
    returnRequestStatus,
    returnRequestCountMin,
    returnRequestCountMax,
    productInCart,
    productInWishlist,
    orderedProduct,
    reviewedProduct,
    isVendor,
    vendorVerified,
    vendorStoreName,
    vendorRatingMin,
    vendorRatingMax,
    vendorTotalSalesMin,
    vendorTotalSalesMax,
    usedCouponCode,
    usedCouponId,
    hasWrittenReviews,
    reviewRatingMin,
    reviewRatingMax,
    reviewCountMin,
    reviewCountMax,
    walletBalanceMin,
    walletBalanceMax,
    hasActiveSession,
    sortBy,
    sortOrder,
  ]);

  const handleToggleStatus = async (id: number, name: string) => {
    if (!confirm(`Toggle status for ${name}?`)) return;
    const res = await toggleUserStatus(id);
    if (res?.success) {
      toast.success("Status updated");
      load();
    } else toast.error("Failed");
  };

  const handleMakeAdmin = async (publicId: string, name: string) => {
    if (!confirm(`Make ${name} an admin?`)) return;
    const res = await makeAdmin(publicId);
    if (res?.success) {
      toast.success("User is now admin");
      load();
    } else toast.error("Failed");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-gray-900">Users</h2>
        <span className="text-sm text-gray-500">{total} total</span>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, phone, or store name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all",
              showFilters
                ? "bg-primary text-white border-primary"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
            )}
          >
            <Filter size={16} />
            Filters
            {filterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                {filterCount}
              </span>
            )}
          </button>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {ROLE_TABS.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setPage(1);
                }}
                className={cn(
                  "shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                  role === r
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-primary",
                )}
              >
                {r === "ALL" ? "All" : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Basic */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Basic
                  </h4>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={verification}
                    onChange={(e) => setVerification(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    {VERIFICATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Info */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Account Info
                  </h4>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display Name"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    {GENDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={ageMin}
                      onChange={(e) => setAgeMin(e.target.value)}
                      placeholder="Age Min"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                    <input
                      type="number"
                      value={ageMax}
                      onChange={(e) => setAgeMax(e.target.value)}
                      placeholder="Age Max"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dobFrom}
                      onChange={(e) => setDobFrom(e.target.value)}
                      placeholder="DOB From"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                    <input
                      type="date"
                      value={dobTo}
                      onChange={(e) => setDobTo(e.target.value)}
                      placeholder="DOB To"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Address
                  </h4>
                  <input
                    type="text"
                    value={addressCityDistrict}
                    onChange={(e) => setAddressCityDistrict(e.target.value)}
                    placeholder="City / District"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <input
                    type="text"
                    value={addressCountry}
                    onChange={(e) => setAddressCountry(e.target.value)}
                    placeholder="Country"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <input
                    type="text"
                    value={addressPostalCode}
                    onChange={(e) => setAddressPostalCode(e.target.value)}
                    placeholder="Postal Code"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <select
                    value={addressType}
                    onChange={(e) => setAddressType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Address Type (Any)</option>
                    <option value="HOME">Home</option>
                    <option value="OFFICE">Office</option>
                    <option value="BILLING">Billing</option>
                    <option value="SHIPPING">Shipping</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <select
                    value={addressIsDefault}
                    onChange={(e) => setAddressIsDefault(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Default Address (Any)</option>
                    <option value="true">Is Default</option>
                    <option value="false">Not Default</option>
                  </select>
                </div>

                {/* Order Aggregates */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Orders
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={orderCountMin}
                      onChange={(e) => setOrderCountMin(e.target.value)}
                      placeholder="Count Min"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                    <input
                      type="number"
                      value={orderCountMax}
                      onChange={(e) => setOrderCountMax(e.target.value)}
                      placeholder="Count Max"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={orderTotalSpentMin}
                      onChange={(e) => setOrderTotalSpentMin(e.target.value)}
                      placeholder="Spent Min (BDT)"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                    <input
                      type="number"
                      value={orderTotalSpentMax}
                      onChange={(e) => setOrderTotalSpentMax(e.target.value)}
                      placeholder="Spent Max (BDT)"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <select
                    value={hasDeliveredOrders}
                    onChange={(e) => setHasDeliveredOrders(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Has Delivered Orders (Any)</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  <select
                    value={hasCancelledOrders}
                    onChange={(e) => setHasCancelledOrders(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Has Cancelled Orders (Any)</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  <select
                    value={hasReturnedOrders}
                    onChange={(e) => setHasReturnedOrders(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Has Returned Orders (Any)</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    {ORDER_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Return Requests */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Returns
                  </h4>
                  <select
                    value={returnRequestStatus}
                    onChange={(e) => setReturnRequestStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    {RETURN_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={returnRequestCountMin}
                      onChange={(e) => setReturnRequestCountMin(e.target.value)}
                      placeholder="Count Min"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                    <input
                      type="number"
                      value={returnRequestCountMax}
                      onChange={(e) => setReturnRequestCountMax(e.target.value)}
                      placeholder="Count Max"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Product Interactions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Product Interactions
                  </h4>
                  <input
                    type="text"
                    value={productInCart}
                    onChange={(e) => setProductInCart(e.target.value)}
                    placeholder="Product IDs in Cart (comma)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <input
                    type="text"
                    value={productInWishlist}
                    onChange={(e) => setProductInWishlist(e.target.value)}
                    placeholder="Product IDs in Wishlist (comma)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <input
                    type="text"
                    value={orderedProduct}
                    onChange={(e) => setOrderedProduct(e.target.value)}
                    placeholder="Product IDs Ordered (comma)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <input
                    type="text"
                    value={reviewedProduct}
                    onChange={(e) => setReviewedProduct(e.target.value)}
                    placeholder="Product IDs Reviewed (comma)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                </div>

                {/* Vendor */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Vendor
                  </h4>
                  <select
                    value={isVendor}
                    onChange={(e) => setIsVendor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Is Vendor (Any)</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  <select
                    value={vendorVerified}
                    onChange={(e) => setVendorVerified(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Verified Vendor (Any)</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                  </select>
                  <input
                    type="text"
                    value={vendorStoreName}
                    onChange={(e) => setVendorStoreName(e.target.value)}
                    placeholder="Store Name"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={vendorRatingMin}
                      onChange={(e) => setVendorRatingMin(e.target.value)}
                      placeholder="Rating Min"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                    <input
                      type="number"
                      value={vendorRatingMax}
                      onChange={(e) => setVendorRatingMax(e.target.value)}
                      placeholder="Rating Max"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={vendorTotalSalesMin}
                      onChange={(e) => setVendorTotalSalesMin(e.target.value)}
                      placeholder="Sales Min"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                    <input
                      type="number"
                      value={vendorTotalSalesMax}
                      onChange={(e) => setVendorTotalSalesMax(e.target.value)}
                      placeholder="Sales Max"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Coupon */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Coupon
                  </h4>
                  <input
                    type="text"
                    value={usedCouponCode}
                    onChange={(e) => setUsedCouponCode(e.target.value)}
                    placeholder="Coupon Code"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <input
                    type="number"
                    value={usedCouponId}
                    onChange={(e) => setUsedCouponId(e.target.value)}
                    placeholder="Coupon ID"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                </div>

                {/* Review */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Reviews
                  </h4>
                  <select
                    value={hasWrittenReviews}
                    onChange={(e) => setHasWrittenReviews(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Has Written Reviews (Any)</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={reviewRatingMin}
                      onChange={(e) => setReviewRatingMin(e.target.value)}
                      placeholder="Rating Min"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                    <input
                      type="number"
                      value={reviewRatingMax}
                      onChange={(e) => setReviewRatingMax(e.target.value)}
                      placeholder="Rating Max"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={reviewCountMin}
                      onChange={(e) => setReviewCountMin(e.target.value)}
                      placeholder="Count Min"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                    <input
                      type="number"
                      value={reviewCountMax}
                      onChange={(e) => setReviewCountMax(e.target.value)}
                      placeholder="Count Max"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Wallet */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Wallet
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={walletBalanceMin}
                      onChange={(e) => setWalletBalanceMin(e.target.value)}
                      placeholder="Balance Min"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                    <input
                      type="number"
                      value={walletBalanceMax}
                      onChange={(e) => setWalletBalanceMax(e.target.value)}
                      placeholder="Balance Max"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Session */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Session
                  </h4>
                  <select
                    value={hasActiveSession}
                    onChange={(e) => setHasActiveSession(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Has Active Session (Any)</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                {/* Date Ranges */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Date Ranges
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={createdAtFrom}
                      onChange={(e) => setCreatedAtFrom(e.target.value)}
                      placeholder="Joined From"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                    <input
                      type="date"
                      value={createdAtTo}
                      onChange={(e) => setCreatedAtTo(e.target.value)}
                      placeholder="Joined To"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={lastLoginFrom}
                      onChange={(e) => setLastLoginFrom(e.target.value)}
                      placeholder="Last Login From"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                    <input
                      type="date"
                      value={lastLoginTo}
                      onChange={(e) => setLastLoginTo(e.target.value)}
                      placeholder="Last Login To"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Sorting */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Sorting
                  </h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    {SORT_BY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(e.target.value as "asc" | "desc")
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-end gap-2 col-span-1 sm:col-span-2 lg:col-span-4">
                  <button
                    onClick={() => {
                      setPage(1);
                      load();
                      setShowFilters(false);
                    }}
                    className="flex-1 btn-primary py-2.5 text-sm"
                  >
                    Apply Filters
                  </button>
                  {(search ||
                    role !== "ALL" ||
                    status !== "all" ||
                    verification !== "all" ||
                    createdAtFrom ||
                    createdAtTo ||
                    lastLoginFrom ||
                    lastLoginTo ||
                    firstName ||
                    lastName ||
                    displayName ||
                    gender ||
                    ageMin ||
                    ageMax ||
                    dobFrom ||
                    dobTo ||
                    addressCityDistrict ||
                    addressCountry ||
                    addressPostalCode ||
                    addressType ||
                    addressIsDefault ||
                    orderCountMin ||
                    orderCountMax ||
                    orderTotalSpentMin ||
                    orderTotalSpentMax ||
                    hasDeliveredOrders ||
                    hasCancelledOrders ||
                    hasReturnedOrders ||
                    orderStatus ||
                    returnRequestStatus ||
                    returnRequestCountMin ||
                    returnRequestCountMax ||
                    productInCart ||
                    productInWishlist ||
                    orderedProduct ||
                    reviewedProduct ||
                    isVendor ||
                    vendorVerified ||
                    vendorStoreName ||
                    vendorRatingMin ||
                    vendorRatingMax ||
                    vendorTotalSalesMin ||
                    vendorTotalSalesMax ||
                    usedCouponCode ||
                    usedCouponId ||
                    hasWrittenReviews ||
                    reviewRatingMin ||
                    reviewRatingMax ||
                    reviewCountMin ||
                    reviewCountMax ||
                    walletBalanceMin ||
                    walletBalanceMax ||
                    hasActiveSession ||
                    sortBy !== "createdAt" ||
                    sortOrder !== "desc") && (
                    <button
                      onClick={() => {
                        clearFilters();
                        load();
                        setShowFilters(false);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-all"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="font-medium">No users found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {[
                    "User",
                    "Email",
                    "Role",
                    "Verified",
                    "Status",
                    "Joined",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-500 px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.accountInfo?.firstName?.[0] ??
                            u.email?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {u.accountInfo?.firstName} {u.accountInfo?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          ROLE_COLOR[u.role] ?? "bg-gray-50 text-gray-600",
                        )}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          u.isEmailVerified
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-50 text-gray-500",
                        )}
                      >
                        {u.isEmailVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          u.isBanned
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600",
                        )}
                      >
                        {u.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="p-1.5 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                          title="View details"
                        >
                          <Eye size={14} />
                        </Link>
                        {u.role !== "ADMIN" && u.role !== "SUPER_ADMIN" && (
                          <button
                            onClick={() => handleMakeAdmin(u.publicId, u.email)}
                            className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50"
                            title="Make Admin"
                          >
                            <Shield size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(u.id, u.email)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                          title="Toggle active/banned"
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">{total} users total</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs text-gray-500">
                {page} / {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / limit)}
                className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
