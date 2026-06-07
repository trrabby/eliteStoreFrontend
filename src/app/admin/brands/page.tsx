/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Award } from "lucide-react";
import {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/services/brand.service";
import { toast } from "sonner";
import Image from "next/image";

type Brand = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  _count?: { products: number };
};

function BrandModal({
  brand,
  onClose,
  onSaved,
}: {
  brand?: Brand;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(brand?.name ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(brand?.logo ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name required");
      return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append("data", JSON.stringify({ name }));
    if (logoFile) fd.append("logo", logoFile);
    const res = brand ? await updateBrand(brand.id, fd) : await createBrand(fd);
    if (res?.success) {
      toast.success(brand ? "Updated!" : "Created!");
      onSaved();
    } else toast.error((res as any)?.message ?? "Failed");
    setSaving(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 text-lg">
            {brand ? "Edit" : "New"} Brand
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Brand Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Logo
            </label>
            <div className="flex items-center gap-3">
              {preview && (
                <Image
                  src={preview}
                  alt=""
                  className="w-12 h-12 rounded-xl object-contain border"
                  width={48}
                  height={48}
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setLogoFile(f);
                  setPreview(URL.createObjectURL(f));
                }}
                className="text-sm text-gray-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary py-3 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary py-3 text-sm disabled:opacity-60"
            >
              {saving ? "Saving..." : brand ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; brand?: Brand }>({
    open: false,
  });

  const load = async () => {
    setLoading(true);
    const res = await getAllBrands({ limit: 100 });
    if (res?.success) setBrands(res.data?.brands ?? res.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete brand "${name}"?`)) return;
    const res = await deleteBrand(id);
    if (res?.success || res === "") {
      toast.success("Deleted");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Brands
        </h2>
        <button
          onClick={() => setModal({ open: true })}
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus size={15} /> Add Brand
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="card p-4 flex flex-col items-center gap-3 group hover:shadow-md transition-shadow text-center"
            >
              {b.logo ? (
                <Image
                  src={b.logo}
                  alt={b.name}
                  className="w-14 h-14 object-contain"
                  width={56}
                  height={56}
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-primary-pale flex items-center justify-center">
                  <Award size={20} className="text-primary" />
                </div>
              )}
              <p className="font-semibold text-gray-900 text-sm">{b.name}</p>
              <p className="text-xs text-gray-400">
                {b._count?.products ?? 0} products
              </p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setModal({ open: true, brand: b })}
                  className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-primary-pale"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(b.id, b.name)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal.open && (
          <BrandModal
            brand={modal.brand}
            onClose={() => setModal({ open: false })}
            onSaved={() => {
              setModal({ open: false });
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
