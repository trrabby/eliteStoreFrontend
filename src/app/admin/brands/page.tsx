/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Award,
  Star,
  Globe,
  MapPin,
  Upload,
} from "lucide-react";
import {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandFeatured,
} from "@/services/brand.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

type Brand = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  description: string | null;
  website: string | null;
  country: string | null;
  isActive: boolean;
  isFeatured: boolean;
  _count?: { products: number };
};

/* ── File Preview ──────────────────────────────────────────────── */
function FilePreview({
  label,
  current,
  aspect = "square",
  onChange,
}: {
  label: string;
  current: string | null;
  aspect?: "square" | "wide";
  onChange: (file: File, preview: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-xs font-medium text-gray-700 mb-1.5">{label}</p>
      <div
        onClick={() => ref.current?.click()}
        className={cn(
          "relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer",
          "hover:border-primary transition-colors group bg-gray-50",
          aspect === "square" ? "w-24 h-24" : "w-full h-24",
        )}
      >
        {current ? (
          <Image src={current} alt={label} fill className="object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-1">
            <Upload
              size={16}
              className="text-gray-300 group-hover:text-primary transition-colors"
            />
            <p className="text-xs text-gray-400">Upload</p>
          </div>
        )}
        {current && (
          <div
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                          transition-opacity flex items-center justify-center"
          >
            <Upload size={16} className="text-white" />
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          onChange(f, URL.createObjectURL(f));
        }}
      />
    </div>
  );
}

/* ── Brand Modal ───────────────────────────────────────────────── */
function BrandModal({
  brand,
  onClose,
  onSaved,
}: {
  brand?: Brand;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: brand?.name ?? "",
    description: brand?.description ?? "",
    website: brand?.website ?? "",
    country: brand?.country ?? "",
    isFeatured: brand?.isFeatured ?? false,
    isActive: brand?.isActive ?? true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPrev, setLogoPrev] = useState<string>(brand?.logo ?? "");
  const [bannerPrev, setBannerPrev] = useState<string>(brand?.banner ?? "");
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Brand name required");
      return;
    }

    setSaving(true);
    const fd = new FormData();
    fd.append(
      "data",
      JSON.stringify({
        name: form.name,
        description: form.description || undefined,
        website: form.website || undefined,
        country: form.country || undefined,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      }),
    );
    if (logoFile) fd.append("logo", logoFile); // field name: logo
    if (bannerFile) fd.append("banner", bannerFile); // field name: banner

    const res = brand ? await updateBrand(brand.id, fd) : await createBrand(fd);

    if (res?.success) {
      toast.success(brand ? "Brand updated!" : "Brand created!");
      onSaved();
    } else {
      toast.error((res as any)?.message ?? "Failed");
    }
    setSaving(false);
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none " +
    "focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-lg
                   bg-white rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
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
          {/* Images */}
          <div className="flex gap-4">
            <FilePreview
              label="Logo"
              current={logoPrev}
              aspect="square"
              onChange={(f, p) => {
                setLogoFile(f);
                setLogoPrev(p);
              }}
            />
            <div className="flex-1">
              <FilePreview
                label="Banner"
                current={bannerPrev}
                aspect="wide"
                onChange={(f, p) => {
                  setBannerFile(f);
                  setBannerPrev(p);
                }}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Brand name"
              className={inputCls}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Brand story or description..."
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Website */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                <Globe size={11} className="inline mr-1" />
                Website
              </label>
              <input
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://brand.com"
                type="url"
                className={inputCls}
              />
            </div>
            {/* Country */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                <MapPin size={11} className="inline mr-1" />
                Country
              </label>
              <input
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                placeholder="Bangladesh"
                className={inputCls}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-4 pt-1">
            {[
              { key: "isFeatured", label: "Featured", icon: Star },
              { key: "isActive", label: "Active" },
            ].map(({ key, label, icon: Icon }) => (
              <label
                key={key}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <div
                  onClick={() => set(key, !(form as any)[key])}
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    (form as any)[key] ? "bg-primary" : "bg-gray-300",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      (form as any)[key] ? "translate-x-5" : "translate-x-0.5",
                    )}
                  />
                </div>
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  {Icon && <Icon size={12} />}
                  {label}
                </span>
              </label>
            ))}
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
              {saving ? "Saving..." : brand ? "Save Changes" : "Create Brand"}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; brand?: Brand }>({
    open: false,
  });

  const load = async () => {
    setLoading(true);
    const res = await getAllBrands({ limit: 100, search: search || undefined });
    if (res?.success) setBrands(res.data?.brands ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (b: Brand) => {
    if ((b._count?.products ?? 0) > 0) {
      toast.error(`Cannot delete — ${b._count?.products} products assigned.`);
      return;
    }
    if (!confirm(`Delete "${b.name}"?`)) return;
    const res = await deleteBrand(b.id);
    if (res?.success) {
      toast.success("Deleted");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  const handleToggleFeatured = async (b: Brand) => {
    const res = await toggleBrandFeatured(b.id);
    if (res?.success) {
      toast.success(
        res.data?.isFeatured ? "Marked featured" : "Removed from featured",
      );
      load();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Brands
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {brands.length} brands total
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus size={15} /> Add Brand
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && load()}
        placeholder="Search brands..."
        className="w-full max-w-sm rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="card p-12 text-center">
          <Award size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">No brands yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {brands.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "card overflow-hidden group hover:shadow-md transition-shadow",
                !b.isActive && "opacity-60",
              )}
            >
              {/* Banner */}
              {b.banner && (
                <div className="relative w-full h-16 bg-gray-100">
                  <Image src={b.banner} alt="" fill className="object-cover" />
                </div>
              )}

              <div className="p-4 flex flex-col items-center gap-2 text-center">
                {b.logo ? (
                  <div className="relative w-12 h-12 -mt-6">
                    <Image
                      src={b.logo}
                      alt={b.name}
                      fill
                      className="object-contain rounded-xl border-2 border-white shadow"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-primary-pale flex items-center justify-center">
                    <Award size={20} className="text-primary" />
                  </div>
                )}

                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {b.name}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-0.5">
                    {b.isFeatured && (
                      <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                    {!b.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  {b.country && (
                    <p className="text-xs text-gray-400 mt-0.5">{b.country}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {b._count?.products ?? 0} products
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setModal({ open: true, brand: b })}
                    className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-primary-pale"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(b)}
                    className="p-1.5 text-gray-400 hover:text-amber-500 rounded-lg hover:bg-amber-50"
                  >
                    <Star
                      size={13}
                      className={
                        b.isFeatured ? "fill-amber-400 text-amber-400" : ""
                      }
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(b)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
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
