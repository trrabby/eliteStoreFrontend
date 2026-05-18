/* eslint-disable react-hooks/immutability */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, MapPin, Check, ChevronRight } from "lucide-react";
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
    router.push("/checkout/payment");
  };

  if (!user) return null;

  return (
    <div className="container-elite py-6 max-w-2xl">
      <CheckoutProgress />

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-display text-xl font-bold text-gray-900
                         flex items-center gap-2"
          >
            <MapPin size={20} className="text-primary" />
            Delivery Address
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-sm text-primary
                       font-medium hover:underline"
          >
            <Plus size={14} />
            Add New
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">No saved addresses</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary px-6 py-2.5 text-sm"
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {addresses.map((addr) => (
              <motion.button
                key={addr.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelected(addr.id)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border-2 transition-all",
                  selected === addr.id
                    ? "border-primary bg-primary-pale"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {addr.fullName}
                      </span>
                      {addr.isDefault && (
                        <span
                          className="text-xs bg-primary text-white
                                         px-2 py-0.5 rounded-full"
                        >
                          Default
                        </span>
                      )}
                      {addr.label && (
                        <span
                          className="text-xs bg-gray-100 text-gray-600
                                         px-2 py-0.5 rounded-full"
                        >
                          {addr.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {addr.addressLine1}
                      {addr.addressLine2 && `, ${addr.addressLine2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {addr.city_district}, {addr.country}
                      {addr.postalCode && ` - ${addr.postalCode}`}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      📞 {addr.phone}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center",
                      "justify-center flex-shrink-0 mt-0.5 transition-all",
                      selected === addr.id
                        ? "border-primary bg-primary"
                        : "border-gray-300",
                    )}
                  >
                    {selected === addr.id && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {addresses.length > 0 && (
          <MagneticButton
            onClick={handleContinue}
            disabled={!selected}
            strength={0.25}
            className="w-full btn-primary py-3.5 flex items-center
                       justify-center gap-2 disabled:opacity-60"
          >
            Continue to Payment
            <ChevronRight size={16} />
          </MagneticButton>
        )}
      </div>

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
