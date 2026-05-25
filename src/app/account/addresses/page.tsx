/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MapPin,
  Star,
  Pencil,
  Trash2,
  Home,
  Building,
  Package,
  CheckCircle2,
  LocateFixed,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import {
  getMyAddresses,
  setDefaultAddress,
  deleteAddress,
} from "@/services/user.service";
import { AddressFormModal } from "@/components/checkout/AddressFormModal";
import type { IAddress } from "@/types/user.types";

// Helper to get address type icon
const getAddressIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "home":
      return <Home size={18} />;
    case "office":
    case "work":
      return <Building size={18} />;
    default:
      return <Package size={18} />;
  }
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAddr, setEditAddr] = useState<IAddress | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await getMyAddresses();
    if (res?.success) setAddresses(res.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSetDefault = async (id: number) => {
    const res = await setDefaultAddress(id);
    if (res?.success) {
      toast.success("Default address updated");
      load();
    } else {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete this address?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#ffffff",
      color: "#111827",
      confirmButtonColor: "#7C3AED",
      cancelButtonColor: "#F3F4F6",
      customClass: {
        popup: "rounded-3xl border border-gray-100 shadow-2xl px-2",
        title: "text-lg font-bold text-gray-900",
        htmlContainer: "text-sm text-gray-500",
        confirmButton:
          "bg-primary text-white px-5 py-2.5 ml-2 rounded-xl cursor-pointer font-medium hover:opacity-90 transition",
        cancelButton:
          "bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition cursor-pointer",
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      const deleteToast = toast.loading("Deleting...");
      try {
        const res = await deleteAddress(id);
        if (res?.success) {
          toast.success("Address deleted", { id: deleteToast });
          load();
        } else {
          toast.error(res?.message ?? "Failed to delete", { id: deleteToast });
        }
      } catch {
        toast.error("Failed to delete address", { id: deleteToast });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Saved Addresses
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your delivery locations
          </p>
        </div>
        <button
          onClick={() => {
            setEditAddr(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-lg"
        >
          <Plus size={16} />
          Add New Address
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid gap-5 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 rounded-3xl bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && addresses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-100 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center"
        >
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <MapPin size={48} className="text-primary" strokeWidth={1.5} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            No addresses yet
          </h3>
          <p className="mb-6 text-sm text-gray-500">
            Add your first address to start shopping
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm"
          >
            <Plus size={16} />
            Add Address
          </button>
        </motion.div>
      )}

      {/* Address Cards Grid */}
      {!loading && addresses.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {addresses.map((addr, index) => (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                layout
                className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-5 transition-all duration-300 hover:shadow-xl ${
                  addr.isDefault
                    ? "border-primary/30 shadow-md shadow-primary/5"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                {/* Default Badge Ribbon (Optional) */}
                {addr.isDefault && (
                  <div className="absolute -right-8 -top-8 h-16 w-16 rotate-45 bg-primary/10" />
                )}

                {/* Card Content */}
                <div className="relative z-10">
                  {/* Header Section */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {/* Icon with gradient background */}
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${
                          addr.isDefault
                            ? "bg-linear-to-br from-primary to-primary/80 text-white shadow-md shadow-primary/20"
                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                        }`}
                      >
                        {getAddressIcon(addr.type)}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-gray-900">
                            {addr.fullName}
                          </h3>
                          {addr.label && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                              {addr.label}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-400 capitalize">
                          {addr.type?.toLowerCase() || "Other"}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                      {!addr.isDefault && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSetDefault(addr.id)}
                          className="rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                          title="Set as default"
                        >
                          <Star size={16} />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditAddr(addr);
                          setShowModal(true);
                        }}
                        className="rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                        title="Edit address"
                      >
                        <Pencil size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(addr.id)}
                        className="rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
                        title="Delete address"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="mb-4 space-y-2 border-l-2 border-gray-100 pl-4">
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={14}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />
                      <div className="space-y-1">
                        <p className="text-sm leading-relaxed text-gray-700">
                          {addr.addressLine1}
                          {addr.addressLine2 && (
                            <span className="text-gray-500">
                              , {addr.addressLine2}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {addr.city_district}
                          {addr.postalCode && `, ${addr.postalCode}`}
                          {addr.landmark && (
                            <span className="block text-gray-400">
                              📍 Near {addr.landmark}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">📞</span>
                      <span className="font-medium text-gray-700">
                        {addr.phone}
                      </span>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                      <p className="text-xs text-gray-400">
                        Added{" "}
                        {addr.createdAt
                          ? new Date(addr.createdAt).toLocaleDateString()
                          : "Unknown date"}
                      </p>
                    </div>

                    {addr.isDefault ? (
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1"
                      >
                        <CheckCircle2 size={12} className="text-green-600" />
                        <span className="text-xs font-semibold text-green-600">
                          Delivery Default
                        </span>
                      </motion.div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSetDefault(addr.id)}
                        className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                      >
                        <LocateFixed size={12} />
                        Set as Default
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Hover Gradient Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Address Form Modal */}
      {showModal && (
        <AddressFormModal
          onClose={() => {
            setShowModal(false);
            setEditAddr(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditAddr(null);
            load();
          }}
          editAddress={editAddr ?? undefined}
        />
      )}
    </div>
  );
}
