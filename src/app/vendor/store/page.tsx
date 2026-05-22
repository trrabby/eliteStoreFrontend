/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Save, Globe, Store, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  getMyVendorProfile,
  createVendorProfile,
  updateVendorProfile,
} from "@/services/vendor.service";
import { formatDate } from "@/lib/utils/date";

export default function VendorStorePage() {
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await getMyVendorProfile();
      if (res?.success && res.data) {
        const v = res.data;
        setVendor(v);
        setStoreName(v.storeName ?? "");
        setSlug(v.slug ?? "");
        setDescription(v.description ?? "");
        setWebsite(v.website ?? "");
        setSupportEmail(v.supportEmail ?? "");
        setSupportPhone(v.supportPhone ?? "");
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!storeName.trim()) {
      toast.error("Store name is required");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append(
        "data",
        JSON.stringify({
          storeName,
          slug,
          description,
          website: website || undefined,
          supportEmail: supportEmail || undefined,
          supportPhone: supportPhone || undefined,
        }),
      );
      if (logoFile) fd.append("logo", logoFile);
      if (bannerFile) fd.append("banner", bannerFile);

      const res = vendor
        ? await updateVendorProfile(fd)
        : await createVendorProfile(fd);

      if (res?.success) {
        toast.success(vendor ? "Store updated!" : "Store created!");
        setVendor(res.data);
        setLogoFile(null);
        setBannerFile(null);
        setLogoPreview(null);
        setBannerPreview(null);
      } else {
        toast.error((res as any)?.message ?? "Failed");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="space-y-4 max-w-2xl">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    );

  const logoSrc = logoPreview ?? vendor?.logo;
  const bannerSrc = bannerPreview ?? vendor?.banner;

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-display text-2xl font-bold text-gray-900">
        My Store
      </h2>

      {/* Verification banner */}
      {vendor && (
        <div
          className={`card p-4 flex items-center gap-3 border-l-4 ${vendor.isVerified ? "border-green-400 bg-green-50/40" : "border-amber-400 bg-amber-50/40"}`}
        >
          <ShieldCheck
            size={18}
            className={vendor.isVerified ? "text-green-600" : "text-amber-600"}
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {vendor.isVerified ? "Verified Vendor" : "Pending Verification"}
            </p>
            <p className="text-xs text-gray-500">
              {vendor.isVerified
                ? "Your store is verified and trusted by customers."
                : "Your store is pending admin verification. Products will be in draft until verified."}
            </p>
          </div>
        </div>
      )}

      {/* Banner */}
      <div className="card overflow-hidden">
        <div
          onClick={() => bannerRef.current?.click()}
          className="relative h-32 bg-gradient-primary cursor-pointer group"
        >
          {bannerSrc && (
            <img
              src={bannerSrc}
              alt="banner"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/80 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <Camera size={12} /> Change Banner
            </div>
          </div>
        </div>
        <input
          ref={bannerRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBannerFile(f);
            setBannerPreview(URL.createObjectURL(f));
          }}
        />

        {/* Logo */}
        <div className="px-5 pb-5 -mt-8 flex items-end gap-4">
          <div
            onClick={() => logoRef.current?.click()}
            className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-lg cursor-pointer group shrink-0"
          >
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-white text-xl font-bold">
                {storeName?.[0] ?? "S"}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={14} className="text-white" />
            </div>
          </div>
          <input
            ref={logoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setLogoFile(f);
              setLogoPreview(URL.createObjectURL(f));
            }}
          />
          <div>
            <p className="font-semibold text-gray-900">
              {storeName || "Your Store"}
            </p>
            {vendor?.isVerified && (
              <p className="text-xs text-green-600 font-medium">✓ Verified</p>
            )}
          </div>
        </div>
      </div>

      {/* Store details */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Store size={15} className="text-primary" />
          Store Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Store Name *
            </label>
            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="My Awesome Store"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Store Slug
            </label>
            <input
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
              }
              placeholder="my-awesome-store"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Store Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Tell customers about your store..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Globe size={13} className="inline mr-1" />
            Website (optional)
          </label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourwebsite.com"
            type="url"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Support Email
            </label>
            <input
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              type="email"
              placeholder="support@yourstore.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Support Phone
            </label>
            <input
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {vendor && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
            {[
              { label: "Total Sales", value: vendor.totalSales ?? 0 },
              {
                label: "Total Revenue",
                value: vendor.totalRevenue
                  ? `৳${Number(vendor.totalRevenue).toLocaleString()}`
                  : "৳0",
              },
              {
                label: "Member Since",
                value: vendor.createdAt ? formatDate(vendor.createdAt) : "—",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-gray-50 rounded-xl p-3 text-center"
              >
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <Save size={14} />
            )}
            {vendor ? "Save Changes" : "Create Store"}
          </button>
        </div>
      </div>
    </div>
  );
}
