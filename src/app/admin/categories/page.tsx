/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Layers } from "lucide-react";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/category.service";
import { toast } from "sonner";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  _count?: { products: number };
};

function CategoryModal({
  cat,
  onClose,
  onSaved,
}: {
  cat?: Category;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(cat?.name ?? "");
  const [desc, setDesc] = useState(cat?.description ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name required");
      return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append("data", JSON.stringify({ name, description: desc || undefined }));
    const res = cat
      ? await updateCategory(cat.id, fd)
      : await createCategory(fd);
    if (res?.success) {
      toast.success(cat ? "Updated!" : "Created!");
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
            {cat ? "Edit" : "New"} Category
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
              Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary resize-none"
            />
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
              {saving ? "Saving..." : cat ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; cat?: Category }>({
    open: false,
  });

  const load = async () => {
    setLoading(true);
    const res = await getAllCategories({ limit: 100 });
    if (res?.success) setCategories(res.data?.categories ?? res.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This will affect products.`)) return;
    const res = await deleteCategory(id);
    if (res?.success || res === "") {
      toast.success("Deleted");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Categories
        </h2>
        <button
          onClick={() => setModal({ open: true })}
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus size={15} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card p-5 flex items-start justify-between group hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-pale flex items-center justify-center">
                  <Layers size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400">
                    {cat._count?.products ?? 0} products
                  </p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setModal({ open: true, cat })}
                  className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-primary-pale"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
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
          <CategoryModal
            cat={modal.cat}
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
