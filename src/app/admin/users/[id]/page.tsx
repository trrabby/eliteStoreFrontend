/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { getUserByEmailOrID } from "@/services/user.service";
import { formatDate, formatDateTime } from "@/lib/utils/date";
import { formatBDT } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Image from "next/image";

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "bg-red-50 text-red-700",
  ADMIN: "bg-purple-50 text-purple-700",
  VENDOR: "bg-amber-50 text-amber-700",
  CUSTOMER: "bg-blue-50 text-blue-700",
};

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  const load = async () => {
    setLoading(true);
    const res = await getUserByEmailOrID(userId);
    if (res?.success) {
      setUser(res.data);
    } else {
      toast.error("Failed to load user details");
      router.push("/admin/users");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-64 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "addresses", label: "Addresses" },
    { id: "orders", label: "Orders" },
    { id: "reviews", label: "Reviews" },
    { id: "wallet", label: "Wallet" },
    { id: "cart", label: "Cart" },
    { id: "wishlist", label: "Wishlist" },
    { id: "vendor", label: "Vendor" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            {user.accountInfo?.firstName} {user.accountInfo?.lastName}
          </h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <span
          className={cn(
            "ml-auto px-3 py-1 rounded-full text-xs font-medium",
            user.isBanned
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600",
          )}
        >
          {user.isBanned ? "Banned" : "Active"}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Orders</p>
          <p className="text-2xl font-bold text-gray-900">
            {user._count?.orders || 0}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Reviews</p>
          <p className="text-2xl font-bold text-gray-900">
            {user._count?.reviews || 0}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Returns</p>
          <p className="text-2xl font-bold text-gray-900">
            {user._count?.returnRequests || 0}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Wallet Balance</p>
          <p className="text-2xl font-bold text-primary">
            {formatBDT(user.wallet?.balance || 0)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide border-b border-gray-100 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-50",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="font-medium">
                  {user.accountInfo?.firstName} {user.accountInfo?.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Display Name</p>
                <p className="font-medium">
                  {user.accountInfo?.displayName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium flex items-center gap-2">
                  {user.email}
                  {user.isEmailVerified ? (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{user.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="font-medium">{user.accountInfo?.gender || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="font-medium">
                  {user.accountInfo?.dateOfBirth
                    ? formatDate(user.accountInfo.dateOfBirth)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    ROLE_COLOR[user.role] ?? "bg-gray-50 text-gray-600",
                  )}
                >
                  {user.role}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Joined</p>
                <p className="font-medium">{formatDateTime(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Login</p>
                <p className="font-medium">
                  {user.lastLoginAt
                    ? formatDateTime(user.lastLoginAt)
                    : "Never"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="space-y-4">
            {user.addresses?.length === 0 ? (
              <p className="text-gray-400 text-sm">No addresses saved</p>
            ) : (
              user.addresses.map((addr: any) => (
                <div
                  key={addr.id}
                  className="border border-gray-100 rounded-xl p-4"
                >
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{addr.fullName}</p>
                      <p className="text-sm text-gray-600">
                        {addr.addressLine1}
                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {addr.city_district}, {addr.country} {addr.postalCode}
                      </p>
                      <p className="text-sm text-gray-500">{addr.phone}</p>
                      {addr.isDefault && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            {user.orders?.length === 0 ? (
              <p className="text-gray-400 text-sm">No orders</p>
            ) : (
              user.orders.map((order: any) => (
                <div
                  key={order.id}
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold">
                        {formatBDT(order.total)}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          order.status === "DELIVERED"
                            ? "bg-green-50 text-green-600"
                            : order.status === "CANCELLED"
                            ? "bg-red-50 text-red-600"
                            : "bg-yellow-50 text-yellow-600",
                        )}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-400">
                      {order.items?.length} items
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            {user.reviews?.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews written</p>
            ) : (
              user.reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="border border-gray-100 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {review.product?.name || "Product"}
                    </span>
                  </div>
                  {review.title && (
                    <p className="font-medium text-sm mt-1">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="text-sm text-gray-600 mt-1">{review.body}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDateTime(review.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "wallet" && (
          <div className="space-y-4">
            <div className="bg-primary-pale rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="font-display text-3xl font-bold text-primary">
                {formatBDT(user.wallet?.balance || 0)}
              </p>
            </div>
            {user.wallet?.transactions?.length === 0 ? (
              <p className="text-gray-400 text-sm">No transactions</p>
            ) : (
              user.wallet?.transactions?.map((txn: any) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between border-b border-gray-100 py-2"
                >
                  <div>
                    <p className="font-medium">{txn.type}</p>
                    <p className="text-xs text-gray-400">
                      {formatDateTime(txn.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={
                        txn.amount > 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {formatBDT(txn.amount)}
                    </p>
                    <p className="text-xs text-gray-400">{txn.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "cart" && (
          <div className="space-y-4">
            {user.cart?.items?.length === 0 ? (
              <p className="text-gray-400 text-sm">Cart is empty</p>
            ) : (
              user.cart?.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b border-gray-100 py-3"
                >
                  {item.product?.images?.[0]?.url && (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.variant?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatBDT(Number(item.variant?.price) * item.quantity)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div className="space-y-4">
            {user.wishlist?.items?.length === 0 ? (
              <p className="text-gray-400 text-sm">Wishlist is empty</p>
            ) : (
              user.wishlist?.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b border-gray-100 py-3"
                >
                  {item.product?.images?.[0]?.url && (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-gray-500">
                      Added {formatDate(item.addedAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "vendor" && (
          <div className="space-y-4">
            {!user.vendorProfile ? (
              <p className="text-gray-400 text-sm">Not a vendor</p>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  {user.vendorProfile.logo && (
                    <Image
                      src={user.vendorProfile.logo}
                      alt={user.vendorProfile.storeName}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-bold text-lg">
                      {user.vendorProfile.storeName}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        Rating: {user.vendorProfile.rating}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          user.vendorProfile.isVerified
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-50 text-gray-500",
                        )}
                      >
                        {user.vendorProfile.isVerified
                          ? "Verified"
                          : "Unverified"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Total Sales</p>
                    <p className="font-bold">
                      {user.vendorProfile.totalSales || 0}
                    </p>
                  </div>
                  <div className="border rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Vendor Due</p>
                    <p className="font-bold text-primary">
                      {formatBDT(user.vendorProfile.vendorDue || 0)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
