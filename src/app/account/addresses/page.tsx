/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MapPin, Star, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getMyAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "@/services/user.service";
import { AddressFormModal } from "@/components/checkout/AddressFormModal";
import type { IAddress } from "@/types/user.types";

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
    if (!confirm("Delete this address?")) return;
    const res = await deleteAddress(id);
    if (res?.success) {
      toast.success("Address deleted");
      load();
    } else {
      toast.error(res?.message ?? "Failed to delete");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Addresses
        </h2>
        <button
          onClick={() => {
            setEditAddr(null);
            setShowModal(true);
          }}
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus size={15} />
          Add New
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center gap-3">
          <MapPin size={48} className="text-gray-200" />
          <p className="text-gray-500">No saved addresses yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-6 py-2.5 text-sm"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {addresses.map((addr) => (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`card p-5 border-2 transition-all ${addr.isDefault ? "border-primary bg-primary-pale/30" : "border-transparent"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-primary flex-shrink-0" />
                    <div className="flex gap-2">
                      {addr.isDefault && (
                        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                      {addr.label && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {addr.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        title="Set as default"
                        className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                      >
                        <Star size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditAddr(addr);
                        setShowModal(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="font-semibold text-gray-900 text-sm">
                  {addr.fullName}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                </p>
                <p className="text-sm text-gray-600">
                  {addr.city_district}, {addr.country}
                </p>
                <p className="text-sm text-gray-500 mt-1">📞 {addr.phone}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

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
