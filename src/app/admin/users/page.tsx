/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Ban,
  Filter,
  X,
  Eye,
  Shield,
  ChevronDown,
  User,
  MapPin,
  ShoppingBag,
  Star,
  Wallet,
  Tag,
  Store,
  Calendar,
  Package,
  RotateCcw,
  ArrowUpDown,
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

// ── Constants ─────────────────────────────────────────────────────

const ROLE_TABS = ["ALL", "CUSTOMER", "VENDOR", "ADMIN", "SUPER_ADMIN"];
const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  VENDOR: "Vendor",
  CUSTOMER: "Customer",
};
const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "bg-red-50 text-red-700",
  ADMIN: "bg-purple-50 text-purple-700",
  VENDOR: "bg-amber-50 text-amber-700",
  CUSTOMER: "bg-blue-50 text-blue-700",
};

// ── Filter State type ─────────────────────────────────────────────

type F = {
  // Identity
  email: string;
  phone: string;
  isActive: string;
  isBanned: string;
  isEmailVerified: string;
  // Dates & Activity
  createdAtFrom: string;
  createdAtTo: string;
  lastLoginFrom: string;
  lastLoginTo: string;
  hasActiveSession: string;
  // Account Info
  firstName: string;
  lastName: string;
  displayName: string;
  gender: string;
  ageMin: string;
  ageMax: string;
  dobFrom: string;
  dobTo: string;
  // Address
  addressCityDistrict: string;
  addressCountry: string;
  addressPostalCode: string;
  addressType: string;
  addressIsDefault: string;
  // Orders
  orderCountMin: string;
  orderCountMax: string;
  orderTotalSpentMin: string;
  orderTotalSpentMax: string;
  hasDeliveredOrders: string;
  hasCancelledOrders: string;
  hasReturnedOrders: string;
  orderStatus: string;
  // Returns
  returnRequestStatus: string;
  returnRequestCountMin: string;
  returnRequestCountMax: string;
  // Products
  productInCart: string;
  productInWishlist: string;
  orderedProduct: string;
  reviewedProduct: string;
  // Vendor
  isVendor: string;
  vendorVerified: string;
  vendorStoreName: string;
  vendorRatingMin: string;
  vendorRatingMax: string;
  vendorTotalSalesMin: string;
  vendorTotalSalesMax: string;
  // Coupons
  usedCouponCode: string;
  usedCouponId: string;
  // Reviews
  hasWrittenReviews: string;
  reviewRatingMin: string;
  reviewRatingMax: string;
  reviewCountMin: string;
  reviewCountMax: string;
  // Wallet
  walletBalanceMin: string;
  walletBalanceMax: string;
  // Sort
  sortBy: string;
  sortOrder: string;
};

const INIT: F = {
  email: "",
  phone: "",
  isActive: "",
  isBanned: "",
  isEmailVerified: "",
  createdAtFrom: "",
  createdAtTo: "",
  lastLoginFrom: "",
  lastLoginTo: "",
  hasActiveSession: "",
  firstName: "",
  lastName: "",
  displayName: "",
  gender: "",
  ageMin: "",
  ageMax: "",
  dobFrom: "",
  dobTo: "",
  addressCityDistrict: "",
  addressCountry: "",
  addressPostalCode: "",
  addressType: "",
  addressIsDefault: "",
  orderCountMin: "",
  orderCountMax: "",
  orderTotalSpentMin: "",
  orderTotalSpentMax: "",
  hasDeliveredOrders: "",
  hasCancelledOrders: "",
  hasReturnedOrders: "",
  orderStatus: "",
  returnRequestStatus: "",
  returnRequestCountMin: "",
  returnRequestCountMax: "",
  productInCart: "",
  productInWishlist: "",
  orderedProduct: "",
  reviewedProduct: "",
  isVendor: "",
  vendorVerified: "",
  vendorStoreName: "",
  vendorRatingMin: "",
  vendorRatingMax: "",
  vendorTotalSalesMin: "",
  vendorTotalSalesMax: "",
  usedCouponCode: "",
  usedCouponId: "",
  hasWrittenReviews: "",
  reviewRatingMin: "",
  reviewRatingMax: "",
  reviewCountMin: "",
  reviewCountMax: "",
  walletBalanceMin: "",
  walletBalanceMax: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

// Human-readable labels for active chips
const CHIP_LABELS: Record<keyof F, string> = {
  email: "Email",
  phone: "Phone",
  isActive: "Active",
  isBanned: "Banned",
  isEmailVerified: "Email Verified",
  createdAtFrom: "Joined ≥",
  createdAtTo: "Joined ≤",
  lastLoginFrom: "Login ≥",
  lastLoginTo: "Login ≤",
  hasActiveSession: "Session",
  firstName: "First",
  lastName: "Last",
  displayName: "Display",
  gender: "Gender",
  ageMin: "Age ≥",
  ageMax: "Age ≤",
  dobFrom: "DOB ≥",
  dobTo: "DOB ≤",
  addressCityDistrict: "City",
  addressCountry: "Country",
  addressPostalCode: "Postal",
  addressType: "Addr Type",
  addressIsDefault: "Default Addr",
  orderCountMin: "Orders ≥",
  orderCountMax: "Orders ≤",
  orderTotalSpentMin: "Spent ≥",
  orderTotalSpentMax: "Spent ≤",
  hasDeliveredOrders: "Delivered",
  hasCancelledOrders: "Cancelled",
  hasReturnedOrders: "Returned",
  orderStatus: "Order Status",
  returnRequestStatus: "Return Status",
  returnRequestCountMin: "Returns ≥",
  returnRequestCountMax: "Returns ≤",
  productInCart: "In Cart",
  productInWishlist: "In Wishlist",
  orderedProduct: "Ordered",
  reviewedProduct: "Reviewed",
  isVendor: "Is Vendor",
  vendorVerified: "Vendor Verified",
  vendorStoreName: "Store",
  vendorRatingMin: "Rating ≥",
  vendorRatingMax: "Rating ≤",
  vendorTotalSalesMin: "Sales ≥",
  vendorTotalSalesMax: "Sales ≤",
  usedCouponCode: "Coupon",
  usedCouponId: "Coupon ID",
  hasWrittenReviews: "Has Reviews",
  reviewRatingMin: "Rev ≥",
  reviewRatingMax: "Rev ≤",
  reviewCountMin: "Rev Count ≥",
  reviewCountMax: "Rev Count ≤",
  walletBalanceMin: "Wallet ≥",
  walletBalanceMax: "Wallet ≤",
  sortBy: "Sort By",
  sortOrder: "Order",
};

// Keys per group (for counting active per section)
const GK: Record<string, (keyof F)[]> = {
  identity: ["email", "phone", "isActive", "isBanned", "isEmailVerified"],
  dates: [
    "createdAtFrom",
    "createdAtTo",
    "lastLoginFrom",
    "lastLoginTo",
    "hasActiveSession",
  ],
  account: [
    "firstName",
    "lastName",
    "displayName",
    "gender",
    "ageMin",
    "ageMax",
    "dobFrom",
    "dobTo",
  ],
  address: [
    "addressCityDistrict",
    "addressCountry",
    "addressPostalCode",
    "addressType",
    "addressIsDefault",
  ],
  orders: [
    "orderCountMin",
    "orderCountMax",
    "orderTotalSpentMin",
    "orderTotalSpentMax",
    "hasDeliveredOrders",
    "hasCancelledOrders",
    "hasReturnedOrders",
    "orderStatus",
  ],
  returns: [
    "returnRequestStatus",
    "returnRequestCountMin",
    "returnRequestCountMax",
  ],
  products: [
    "productInCart",
    "productInWishlist",
    "orderedProduct",
    "reviewedProduct",
  ],
  vendor: [
    "isVendor",
    "vendorVerified",
    "vendorStoreName",
    "vendorRatingMin",
    "vendorRatingMax",
    "vendorTotalSalesMin",
    "vendorTotalSalesMax",
  ],
  coupons: ["usedCouponCode", "usedCouponId"],
  reviews: [
    "hasWrittenReviews",
    "reviewRatingMin",
    "reviewRatingMax",
    "reviewCountMin",
    "reviewCountMax",
  ],
  wallet: ["walletBalanceMin", "walletBalanceMax"],
  sort: ["sortBy", "sortOrder"],
};

// Count active filters in one group
const groupCount = (gId: string, f: F) =>
  (GK[gId] ?? []).filter((k) => {
    if (k === "sortBy" && f[k] === "createdAt") return false;
    if (k === "sortOrder" && f[k] === "desc") return false;
    return f[k] !== "";
  }).length;

// Total active across all groups
const totalCount = (f: F) =>
  (Object.keys(f) as (keyof F)[]).filter((k) => {
    if (k === "sortBy" && f[k] === "createdAt") return false;
    if (k === "sortOrder" && f[k] === "desc") return false;
    return f[k] !== "";
  }).length;

// Format chip display value
const chipVal = (k: keyof F, v: string) =>
  v === "true" ? "Yes" : v === "false" ? "No" : v;

// ── Shared input styling ──────────────────────────────────────────

const inp = [
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white",
  "outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all",
].join(" ");
const lbl = "block text-xs font-medium text-gray-500 mb-1.5";

// ── Reusable mini-components ──────────────────────────────────────

function FSel({
  label,
  value,
  onChange,
  opts,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  opts: { value: string; label: string }[];
}) {
  return (
    <div>
      {label && <label className={lbl}>{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inp}
      >
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FText({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      {label && <label className={lbl}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inp}
      />
    </div>
  );
}

function FRange({
  label,
  minVal,
  maxVal,
  onMin,
  onMax,
  minPh = "Min",
  maxPh = "Max",
}: {
  label: string;
  minVal: string;
  maxVal: string;
  onMin: (v: string) => void;
  onMax: (v: string) => void;
  minPh?: string;
  maxPh?: string;
}) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          value={minVal}
          onChange={(e) => onMin(e.target.value)}
          placeholder={minPh}
          className={inp}
        />
        <input
          type="number"
          value={maxVal}
          onChange={(e) => onMax(e.target.value)}
          placeholder={maxPh}
          className={inp}
        />
      </div>
    </div>
  );
}

function FDateRange({
  label,
  fromVal,
  toVal,
  onFrom,
  onTo,
}: {
  label: string;
  fromVal: string;
  toVal: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
}) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          value={fromVal}
          onChange={(e) => onFrom(e.target.value)}
          className={inp}
        />
        <input
          type="date"
          value={toVal}
          onChange={(e) => onTo(e.target.value)}
          className={inp}
        />
      </div>
    </div>
  );
}

// ── Accordion filter section ──────────────────────────────────────

function FilterSection({
  icon: Icon,
  label,
  activeCount,
  children,
}: {
  icon: any;
  label: string;
  activeCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(activeCount > 0);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-3.5
                   hover:bg-gray-50/80 transition-colors"
      >
        {/* Icon */}
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
            activeCount > 0 ? "bg-primary/10" : "bg-gray-100",
          )}
        >
          <Icon
            size={13}
            className={activeCount > 0 ? "text-primary" : "text-gray-400"}
          />
        </div>

        {/* Label */}
        <span
          className={cn(
            "text-sm font-medium flex-1 text-left",
            activeCount > 0 ? "text-primary" : "text-gray-700",
          )}
        >
          {label}
        </span>

        {/* Active badge */}
        {activeCount > 0 && (
          <span
            className="min-w-[20px] h-5 bg-primary text-white text-[10px] font-bold
                           rounded-full flex items-center justify-center px-1.5 shrink-0"
          >
            {activeCount}
          </span>
        )}

        <ChevronDown
          size={14}
          className={cn(
            "text-gray-400 transition-transform duration-200 shrink-0",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-5 pt-1 pb-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("ALL");
  const [search, setSearch] = useState("");
  const [dSearch, setDSearch] = useState(""); // debounced
  const [filters, setFilters] = useState<F>(INIT); // committed
  const [draft, setDraft] = useState<F>(INIT); // in-drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const limit = 15;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Convenience: update one draft field
  const setD = (key: keyof F, val: string) =>
    setDraft((d) => ({ ...d, [key]: val }));

  // Computed counts
  const committedCount = useMemo(() => totalCount(filters), [filters]);
  const draftTotal = useMemo(() => totalCount(draft), [draft]);

  // Active chips from committed filters
  const chips = useMemo(
    () =>
      (Object.entries(filters) as [keyof F, string][])
        .filter(([k, v]) => {
          if (k === "sortBy" && v === "createdAt") return false;
          if (k === "sortOrder" && v === "desc") return false;
          return v !== "";
        })
        .map(([k, v]) => ({
          key: k,
          label: CHIP_LABELS[k] ?? k,
          value: chipVal(k, v),
        })),
    [filters],
  );

  // Build API params from committed state
  const buildParams = useCallback(() => {
    const p: Record<string, any> = {
      page,
      limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
    if (dSearch) p.search = dSearch;
    if (role !== "ALL") p.role = role;

    const SKIP = new Set(["sortBy", "sortOrder"]);
    for (const [k, v] of Object.entries(filters) as [keyof F, string][]) {
      if (SKIP.has(k) || !v) continue;
      p[k] = v;
    }
    return p;
  }, [page, role, dSearch, filters]);

  // Fetch
  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAllUsers(buildParams() as any);
    if (res?.success) {
      setUsers(res.data?.users ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  }, [buildParams]);

  useEffect(() => {
    load();
  }, [load]);

  // Drawer helpers
  const openDrawer = () => {
    setDraft({ ...filters });
    setShowDrawer(true);
  };
  const applyFilters = () => {
    setFilters({ ...draft });
    setPage(1);
    setShowDrawer(false);
  };
  const removeChip = (key: keyof F) => {
    const next = { ...filters, [key]: INIT[key] };
    setFilters(next);
    setDraft(next);
    setPage(1);
  };
  const clearAll = () => {
    setFilters(INIT);
    setDraft(INIT);
    setPage(1);
  };

  // Action handlers
  const handleToggle = async (id: number, email: string) => {
    if (!confirm(`Toggle status for ${email}?`)) return;
    const res = await toggleUserStatus(id);
    if (res?.success) {
      toast.success("Status updated");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };
  const handleMakeAdmin = async (publicId: string, email: string) => {
    if (!confirm(`Make ${email} an admin?`)) return;
    const res = await makeAdmin(publicId);
    if (res?.success) {
      toast.success("Role updated");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  return (
    <div className="space-y-4">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Users
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? "Loading..." : `${total.toLocaleString()} users`}
          </p>
        </div>
      </div>

      {/* ── Search + Filter button ─────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, phone, store..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm
                         outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter button */}
          <button
            onClick={openDrawer}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
              committedCount > 0
                ? "bg-primary text-white border-primary"
                : "bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary",
            )}
          >
            <Filter size={14} />
            Filters
            {committedCount > 0 && (
              <span
                className="min-w-[20px] h-5 bg-white text-primary text-xs font-bold
                               rounded-full flex items-center justify-center px-1.5"
              >
                {committedCount}
              </span>
            )}
          </button>
        </div>

        {/* Role tabs */}
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
              {r === "ALL" ? "All Roles" : ROLE_LABEL[r] ?? r}
            </button>
          ))}
        </div>

        {/* Active chips */}
        <AnimatePresence>
          {chips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap items-center gap-2"
            >
              {chips.map((chip) => (
                <span
                  key={chip.key}
                  className="flex items-center gap-1.5 bg-primary-pale border border-primary/20
                             text-xs font-medium px-2.5 py-1.5 rounded-full"
                >
                  <span className="text-gray-500">{chip.label}:</span>
                  <span className="text-primary font-semibold">
                    {chip.value}
                  </span>
                  <button
                    onClick={() => removeChip(chip.key)}
                    className="text-gray-400 hover:text-primary transition-colors ml-0.5"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAll}
                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 px-1"
              >
                <X size={11} /> Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Results table ──────────────────────────────────────── */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-14 text-center">
            <User size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="font-medium text-gray-500">No users found</p>
            {(committedCount > 0 || search) && (
              <button
                onClick={() => {
                  clearAll();
                  setSearch("");
                }}
                className="text-sm text-primary hover:underline mt-2"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    {[
                      "User",
                      "Contact",
                      "Role",
                      "Status",
                      "Stats",
                      "Joined",
                      "",
                    ].map((h, i) => (
                      <th
                        key={i}
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
                      transition={{ delay: i * 0.025 }}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 group"
                    >
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full bg-gradient-primary
                                          flex items-center justify-center text-white text-xs font-bold shrink-0"
                          >
                            {(
                              u.accountInfo?.firstName?.[0] ??
                              u.email?.[0] ??
                              "?"
                            ).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {u.accountInfo
                                ? `${u.accountInfo.firstName} ${u.accountInfo.lastName}`
                                : "—"}
                            </p>
                            {u.vendorProfile && (
                              <p className="text-xs text-amber-600 truncate flex items-center gap-1 mt-0.5">
                                <Store size={10} />
                                {u.vendorProfile.storeName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="text-sm text-gray-600 truncate">
                          {u.email}
                        </p>
                        {u.phone && (
                          <p className="text-xs text-gray-400">{u.phone}</p>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            ROLE_COLOR[u.role] ?? "bg-gray-50 text-gray-600",
                          )}
                        >
                          {ROLE_LABEL[u.role] ?? u.role}
                        </span>
                        <p className="text-xs mt-0.5">
                          {u.isEmailVerified ? (
                            <span className="text-green-500">✓ Verified</span>
                          ) : (
                            <span className="text-gray-400">Unverified</span>
                          )}
                        </p>
                      </td>

                      {/* Status */}
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
                        {!u.isActive && !u.isBanned && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-1">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Stats */}
                      <td className="px-4 py-3 text-xs text-gray-500">
                        <p>
                          <span className="font-semibold text-gray-700">
                            {u._count?.orders ?? 0}
                          </span>{" "}
                          orders
                        </p>
                        <p className="text-gray-400">
                          {u._count?.reviews ?? 0} reviews
                        </p>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-1
                                        opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="p-1.5 text-gray-400 hover:text-primary
                                       rounded-lg hover:bg-primary-pale transition-all"
                            title="View"
                          >
                            <Eye size={13} />
                          </Link>
                          {u.role !== "ADMIN" && u.role !== "SUPER_ADMIN" && (
                            <button
                              onClick={() =>
                                handleMakeAdmin(u.publicId, u.email)
                              }
                              title="Make Admin"
                              className="p-1.5 text-gray-400 hover:text-purple-600
                                         rounded-lg hover:bg-purple-50 transition-all"
                            >
                              <Shield size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggle(u.id, u.email)}
                            title={u.isBanned ? "Unban" : "Ban"}
                            className="p-1.5 text-gray-400 hover:text-red-500
                                       rounded-lg hover:bg-red-50 transition-all"
                          >
                            <Ban size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of{" "}
                  {total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border text-xs font-medium
                               disabled:opacity-40 hover:border-primary transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-600">
                    {page} / {Math.ceil(total / limit)}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(total / limit)}
                    className="px-3 py-1.5 rounded-lg border text-xs font-medium
                               disabled:opacity-40 hover:border-primary transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Filter Drawer ──────────────────────────────────────── */}
      <AnimatePresence>
        {showDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50
                         flex flex-col shadow-2xl"
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-5 py-4
                              border-b border-gray-100 shrink-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary-pale flex items-center justify-center">
                    <Filter size={15} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Filters
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {draftTotal > 0 ? (
                        <span className="text-primary">
                          {draftTotal} active
                        </span>
                      ) : (
                        "Click a section to expand"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {draftTotal > 0 && (
                    <button
                      onClick={() => setDraft(INIT)}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg
                                 hover:bg-red-50 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setShowDrawer(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Drawer body — scrollable filter sections */}
              <div className="flex-1 overflow-y-auto">
                {/* Identity */}
                <FilterSection
                  icon={User}
                  label="Identity"
                  activeCount={groupCount("identity", draft)}
                >
                  <FText
                    label="Email"
                    value={draft.email}
                    onChange={(v) => setD("email", v)}
                    placeholder="user@example.com"
                    type="email"
                  />
                  <FText
                    label="Phone"
                    value={draft.phone}
                    onChange={(v) => setD("phone", v)}
                    placeholder="+880..."
                  />
                  <FSel
                    label="Account Status"
                    value={draft.isActive}
                    onChange={(v) => setD("isActive", v)}
                    opts={[
                      { value: "", label: "Any" },
                      { value: "true", label: "Active" },
                      { value: "false", label: "Inactive" },
                    ]}
                  />
                  <FSel
                    label="Ban Status"
                    value={draft.isBanned}
                    onChange={(v) => setD("isBanned", v)}
                    opts={[
                      { value: "", label: "Any" },
                      { value: "false", label: "Not Banned" },
                      { value: "true", label: "Banned" },
                    ]}
                  />
                  <FSel
                    label="Email Verification"
                    value={draft.isEmailVerified}
                    onChange={(v) => setD("isEmailVerified", v)}
                    opts={[
                      { value: "", label: "Any" },
                      { value: "true", label: "Verified" },
                      { value: "false", label: "Unverified" },
                    ]}
                  />
                </FilterSection>

                {/* Account Info */}
                <FilterSection
                  icon={User}
                  label="Account Info"
                  activeCount={groupCount("account", draft)}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <FText
                      label="First Name"
                      value={draft.firstName}
                      onChange={(v) => setD("firstName", v)}
                      placeholder="John"
                    />
                    <FText
                      label="Last Name"
                      value={draft.lastName}
                      onChange={(v) => setD("lastName", v)}
                      placeholder="Doe"
                    />
                  </div>
                  <FText
                    label="Display Name"
                    value={draft.displayName}
                    onChange={(v) => setD("displayName", v)}
                    placeholder="johndoe"
                  />
                  <FSel
                    label="Gender"
                    value={draft.gender}
                    onChange={(v) => setD("gender", v)}
                    opts={[
                      { value: "", label: "Any gender" },
                      { value: "MALE", label: "Male" },
                      { value: "FEMALE", label: "Female" },
                      { value: "OTHER", label: "Other" },
                      {
                        value: "PREFER_NOT_TO_SAY",
                        label: "Prefer not to say",
                      },
                    ]}
                  />
                  <FRange
                    label="Age Range"
                    minVal={draft.ageMin}
                    maxVal={draft.ageMax}
                    onMin={(v) => setD("ageMin", v)}
                    onMax={(v) => setD("ageMax", v)}
                    minPh="Min age"
                    maxPh="Max age"
                  />
                  <FDateRange
                    label="Date of Birth"
                    fromVal={draft.dobFrom}
                    toVal={draft.dobTo}
                    onFrom={(v) => setD("dobFrom", v)}
                    onTo={(v) => setD("dobTo", v)}
                  />
                </FilterSection>

                {/* Dates & Activity */}
                <FilterSection
                  icon={Calendar}
                  label="Dates & Activity"
                  activeCount={groupCount("dates", draft)}
                >
                  <FDateRange
                    label="Joined Date Range"
                    fromVal={draft.createdAtFrom}
                    toVal={draft.createdAtTo}
                    onFrom={(v) => setD("createdAtFrom", v)}
                    onTo={(v) => setD("createdAtTo", v)}
                  />
                  <FDateRange
                    label="Last Login Range"
                    fromVal={draft.lastLoginFrom}
                    toVal={draft.lastLoginTo}
                    onFrom={(v) => setD("lastLoginFrom", v)}
                    onTo={(v) => setD("lastLoginTo", v)}
                  />
                  <FSel
                    label="Active Session"
                    value={draft.hasActiveSession}
                    onChange={(v) => setD("hasActiveSession", v)}
                    opts={[
                      { value: "", label: "Any" },
                      { value: "true", label: "Has active session" },
                      { value: "false", label: "No active session" },
                    ]}
                  />
                </FilterSection>

                {/* Address */}
                <FilterSection
                  icon={MapPin}
                  label="Address"
                  activeCount={groupCount("address", draft)}
                >
                  <FText
                    label="City / District"
                    value={draft.addressCityDistrict}
                    onChange={(v) => setD("addressCityDistrict", v)}
                    placeholder="Dhaka"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FText
                      label="Country"
                      value={draft.addressCountry}
                      onChange={(v) => setD("addressCountry", v)}
                      placeholder="BD"
                    />
                    <FText
                      label="Postal Code"
                      value={draft.addressPostalCode}
                      onChange={(v) => setD("addressPostalCode", v)}
                      placeholder="1000"
                    />
                  </div>
                  <FSel
                    label="Address Type"
                    value={draft.addressType}
                    onChange={(v) => setD("addressType", v)}
                    opts={[
                      { value: "", label: "Any type" },
                      { value: "HOME", label: "Home" },
                      { value: "OFFICE", label: "Office" },
                      { value: "BILLING", label: "Billing" },
                      { value: "SHIPPING", label: "Shipping" },
                      { value: "OTHER", label: "Other" },
                    ]}
                  />
                  <FSel
                    label="Is Default Address"
                    value={draft.addressIsDefault}
                    onChange={(v) => setD("addressIsDefault", v)}
                    opts={[
                      { value: "", label: "Any" },
                      { value: "true", label: "Is default" },
                      { value: "false", label: "Not default" },
                    ]}
                  />
                </FilterSection>

                {/* Orders */}
                <FilterSection
                  icon={ShoppingBag}
                  label="Orders"
                  activeCount={groupCount("orders", draft)}
                >
                  <FRange
                    label="Order Count"
                    minVal={draft.orderCountMin}
                    maxVal={draft.orderCountMax}
                    onMin={(v) => setD("orderCountMin", v)}
                    onMax={(v) => setD("orderCountMax", v)}
                  />
                  <FRange
                    label="Total Spent (৳)"
                    minVal={draft.orderTotalSpentMin}
                    maxVal={draft.orderTotalSpentMax}
                    onMin={(v) => setD("orderTotalSpentMin", v)}
                    onMax={(v) => setD("orderTotalSpentMax", v)}
                  />
                  <FSel
                    label="Order Status"
                    value={draft.orderStatus}
                    onChange={(v) => setD("orderStatus", v)}
                    opts={[
                      { value: "", label: "Any status" },
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
                    ]}
                  />
                  <div className="space-y-2 pt-1">
                    <label className={lbl}>Order History</label>
                    {(
                      [
                        ["hasDeliveredOrders", "Delivered orders"],
                        ["hasCancelledOrders", "Cancelled orders"],
                        ["hasReturnedOrders", "Returned orders"],
                      ] as [keyof F, string][]
                    ).map(([key, label]) => (
                      <FSel
                        key={key}
                        value={draft[key]}
                        onChange={(v) => setD(key, v)}
                        opts={[
                          { value: "", label: `${label}: Any` },
                          {
                            value: "true",
                            label: `Has ${label.toLowerCase()}`,
                          },
                          {
                            value: "false",
                            label: `No ${label.toLowerCase()}`,
                          },
                        ]}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* Returns */}
                <FilterSection
                  icon={RotateCcw}
                  label="Return Requests"
                  activeCount={groupCount("returns", draft)}
                >
                  <FSel
                    label="Return Status"
                    value={draft.returnRequestStatus}
                    onChange={(v) => setD("returnRequestStatus", v)}
                    opts={[
                      { value: "", label: "Any" },
                      { value: "PENDING", label: "Pending" },
                      { value: "APPROVED", label: "Approved" },
                      { value: "REJECTED", label: "Rejected" },
                      { value: "COMPLETED", label: "Completed" },
                    ]}
                  />
                  <FRange
                    label="Return Count"
                    minVal={draft.returnRequestCountMin}
                    maxVal={draft.returnRequestCountMax}
                    onMin={(v) => setD("returnRequestCountMin", v)}
                    onMax={(v) => setD("returnRequestCountMax", v)}
                  />
                </FilterSection>

                {/* Product Interactions */}
                <FilterSection
                  icon={Package}
                  label="Product Interactions"
                  activeCount={groupCount("products", draft)}
                >
                  <p className="text-xs text-gray-400 -mt-1 mb-1">
                    Enter product IDs separated by commas
                  </p>
                  <FText
                    label="Product IDs in Cart"
                    value={draft.productInCart}
                    onChange={(v) => setD("productInCart", v)}
                    placeholder="1,2,3"
                  />
                  <FText
                    label="Product IDs in Wishlist"
                    value={draft.productInWishlist}
                    onChange={(v) => setD("productInWishlist", v)}
                    placeholder="1,2,3"
                  />
                  <FText
                    label="Ordered Product IDs"
                    value={draft.orderedProduct}
                    onChange={(v) => setD("orderedProduct", v)}
                    placeholder="1,2,3"
                  />
                  <FText
                    label="Reviewed Product IDs"
                    value={draft.reviewedProduct}
                    onChange={(v) => setD("reviewedProduct", v)}
                    placeholder="1,2,3"
                  />
                </FilterSection>

                {/* Vendor */}
                <FilterSection
                  icon={Store}
                  label="Vendor"
                  activeCount={groupCount("vendor", draft)}
                >
                  <FSel
                    label="Is Vendor"
                    value={draft.isVendor}
                    onChange={(v) => setD("isVendor", v)}
                    opts={[
                      { value: "", label: "Any" },
                      { value: "true", label: "Is vendor" },
                      { value: "false", label: "Not vendor" },
                    ]}
                  />
                  <FSel
                    label="Verification"
                    value={draft.vendorVerified}
                    onChange={(v) => setD("vendorVerified", v)}
                    opts={[
                      { value: "", label: "Any" },
                      { value: "true", label: "Verified" },
                      { value: "false", label: "Unverified" },
                    ]}
                  />
                  <FText
                    label="Store Name"
                    value={draft.vendorStoreName}
                    onChange={(v) => setD("vendorStoreName", v)}
                    placeholder="Store name..."
                  />
                  <FRange
                    label="Vendor Rating"
                    minPh="0"
                    maxPh="5"
                    minVal={draft.vendorRatingMin}
                    maxVal={draft.vendorRatingMax}
                    onMin={(v) => setD("vendorRatingMin", v)}
                    onMax={(v) => setD("vendorRatingMax", v)}
                  />
                  <FRange
                    label="Total Sales"
                    minVal={draft.vendorTotalSalesMin}
                    maxVal={draft.vendorTotalSalesMax}
                    onMin={(v) => setD("vendorTotalSalesMin", v)}
                    onMax={(v) => setD("vendorTotalSalesMax", v)}
                  />
                </FilterSection>

                {/* Coupons */}
                <FilterSection
                  icon={Tag}
                  label="Coupons"
                  activeCount={groupCount("coupons", draft)}
                >
                  <FText
                    label="Coupon Code Used"
                    value={draft.usedCouponCode}
                    onChange={(v) => setD("usedCouponCode", v)}
                    placeholder="SAVE20"
                  />
                  <FText
                    label="Coupon ID"
                    value={draft.usedCouponId}
                    onChange={(v) => setD("usedCouponId", v)}
                    placeholder="12"
                    type="number"
                  />
                </FilterSection>

                {/* Reviews */}
                <FilterSection
                  icon={Star}
                  label="Reviews"
                  activeCount={groupCount("reviews", draft)}
                >
                  <FSel
                    label="Has Written Reviews"
                    value={draft.hasWrittenReviews}
                    onChange={(v) => setD("hasWrittenReviews", v)}
                    opts={[
                      { value: "", label: "Any" },
                      { value: "true", label: "Yes" },
                      { value: "false", label: "No" },
                    ]}
                  />
                  <FRange
                    label="Review Rating"
                    minPh="1"
                    maxPh="5"
                    minVal={draft.reviewRatingMin}
                    maxVal={draft.reviewRatingMax}
                    onMin={(v) => setD("reviewRatingMin", v)}
                    onMax={(v) => setD("reviewRatingMax", v)}
                  />
                  <FRange
                    label="Review Count"
                    minVal={draft.reviewCountMin}
                    maxVal={draft.reviewCountMax}
                    onMin={(v) => setD("reviewCountMin", v)}
                    onMax={(v) => setD("reviewCountMax", v)}
                  />
                </FilterSection>

                {/* Wallet */}
                <FilterSection
                  icon={Wallet}
                  label="Wallet"
                  activeCount={groupCount("wallet", draft)}
                >
                  <FRange
                    label="Balance Range (৳)"
                    minVal={draft.walletBalanceMin}
                    maxVal={draft.walletBalanceMax}
                    onMin={(v) => setD("walletBalanceMin", v)}
                    onMax={(v) => setD("walletBalanceMax", v)}
                  />
                </FilterSection>

                {/* Sort */}
                <FilterSection
                  icon={ArrowUpDown}
                  label="Sort & Order"
                  activeCount={groupCount("sort", draft)}
                >
                  <FSel
                    label="Sort By"
                    value={draft.sortBy}
                    onChange={(v) => setD("sortBy", v)}
                    opts={[
                      { value: "createdAt", label: "Joined Date" },
                      { value: "lastLoginAt", label: "Last Login" },
                      { value: "email", label: "Email" },
                      { value: "role", label: "Role" },
                      { value: "firstName", label: "First Name" },
                      { value: "lastName", label: "Last Name" },
                      { value: "displayName", label: "Display Name" },
                    ]}
                  />
                  <FSel
                    label="Sort Order"
                    value={draft.sortOrder}
                    onChange={(v) => setD("sortOrder", v)}
                    opts={[
                      { value: "desc", label: "Descending (newest first)" },
                      { value: "asc", label: "Ascending (oldest first)" },
                    ]}
                  />
                </FilterSection>
              </div>

              {/* Drawer footer */}
              <div className="shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDrawer(false)}
                    className="flex-1 btn-secondary py-3 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyFilters}
                    className="flex-1 btn-primary py-3 text-sm flex items-center justify-center gap-2"
                  >
                    <Filter size={14} />
                    Apply Filters
                    {draftTotal > 0 && (
                      <span
                        className="bg-white/20 text-white text-xs font-bold
                                       px-1.5 py-0.5 rounded-full leading-none"
                      >
                        {draftTotal}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
