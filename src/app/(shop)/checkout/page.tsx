/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  MapPin,
  Check,
  ChevronRight,
  Home,
  Building,
  Package,
  LocateFixed,
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { setAddress } from "@/store/slices/checkoutSlice";
import { selectCheckout } from "@/store/slices/checkoutSlice";
import { getMyAddresses } from "@/services/user.service";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { cn } from "@/lib/utils/cn";
import type { IAddress } from "@/types/user.types";
import { AddressFormModal } from "@/components/checkout/AddressFormModal";

// Helper to get address type icon
const getAddressIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "home":
      return <Home size={16} />;
    case "office":
    case "work":
      return <Building size={16} />;
    default:
      return <Package size={16} />;
  }
};

export default function CheckoutAddressPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const checkout = useAppSelector(selectCheckout);

  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [selected, setSelected] = useState<number | null>(
    checkout.selectedAddressId,
  );
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    setLoading(true);
    const res = await getMyAddresses();
    if (res?.success) {
      const list = res.data ?? [];
      setAddresses(list);
      // auto-select default
      if (!selected) {
        const def = list.find((a: IAddress) => a.isDefault);
        if (def) setSelected(def.id);
      }
    }
    setLoading(false);
  };

  const handleContinue = () => {
    if (!selected) {
      toast.error("Please select a delivery address.");
      return;
    }
    dispatch(setAddress(selected));
    router.push("/checkout/review");
  };

  if (!user) return null;

  return (
    <div className="container-elite py-6 max-w-2xl">
      <CheckoutProgress />

      <div className="card overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/50 p-0 shadow-sm">
        {/* Header with gradient accent */}
        <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-r from-white to-primary/5 p-6">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5" />
          <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-primary/5" />

          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="font-display flex items-center gap-2 text-xl font-bold text-gray-900">
                <div className="rounded-xl bg-primary/10 p-1.5">
                  <MapPin size={18} className="text-primary" />
                </div>
                Delivery Address
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Choose where you want your order delivered
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary/20"
            >
              <Plus size={14} />
              Add New
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 pt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 rounded-2xl bg-gray-100" />
                </div>
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center"
            >
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <MapPin size={40} className="text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No addresses yet
              </h3>
              <p className="mb-6 text-sm text-gray-500">
                Add your first address to continue
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm"
              >
                <Plus size={16} />
                Add Address
              </button>
            </motion.div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-3">
                {addresses.map((addr, index) => (
                  <motion.button
                    key={addr.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelected(addr.id)}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200",
                      selected === addr.id
                        ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/10"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm",
                    )}
                  >
                    {/* Selection Indicator */}
                    <div
                      className={cn(
                        "absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                        selected === addr.id
                          ? "border-primary bg-primary"
                          : "border-gray-300 bg-white",
                      )}
                    >
                      {selected === addr.id && (
                        <Check size={10} className="text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pr-6">
                      {/* Header with Icon and Badges */}
                      <div className="mb-3 flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                            selected === addr.id
                              ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 group-hover:bg-gray-200",
                          )}
                        >
                          {getAddressIcon(addr.type)}
                        </div>

                        <div className="flex-1">
                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {addr.fullName}
                            </span>
                            {addr.isDefault && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                Default
                              </span>
                            )}
                            {addr.label && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                {addr.label}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-400 capitalize">
                            {addr.type?.toLowerCase() || "Other"}
                          </p>
                        </div>
                      </div>

                      {/* Address Details */}
                      <div className="mb-3 space-y-1.5 border-l-2 border-gray-100 pl-3">
                        <div className="flex items-start gap-2">
                          <MapPin
                            size={12}
                            className="mt-0.5 flex-shrink-0 text-gray-400"
                          />
                          <div>
                            <p className="text-sm leading-relaxed text-gray-700">
                              {addr.addressLine1}
                              {addr.addressLine2 && (
                                <span className="text-gray-500">
                                  , {addr.addressLine2}
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {addr.city_district}, {addr.country}
                              {addr.postalCode && ` - ${addr.postalCode}`}
                            </p>
                            {addr.landmark && (
                              <p className="mt-0.5 text-xs text-gray-400">
                                📍 Near {addr.landmark}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">📞</span>
                          <span className="text-sm font-medium text-gray-700">
                            {addr.phone}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                        <div className="h-1 w-1 rounded-full bg-gray-300" />
                        <p className="text-xs text-gray-400">
                          Added{" "}
                          {addr.createdAt
                            ? new Date(addr.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </motion.button>
                ))}
              </div>

              {/* Continue Button */}
              <div className="pt-2">
                <MagneticButton
                  onClick={handleContinue}
                  disabled={!selected}
                  strength={0.25}
                  className={cn(
                    "w-full py-3.5 flex items-center justify-center gap-2 transition-all duration-200",
                    "btn-primary disabled:opacity-60 disabled:cursor-not-allowed",
                  )}
                >
                  <span>Review Order</span>
                  <ChevronRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </MagneticButton>

                {!selected && addresses.length > 0 && (
                  <p className="mt-3 text-center text-xs text-amber-600">
                    Please select an address to continue
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Address Form Modal */}
      {showModal && (
        <AddressFormModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            loadAddresses();
          }}
        />
      )}
    </div>
  );
}
