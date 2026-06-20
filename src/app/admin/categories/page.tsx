/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  ChevronDown,
  Layers,
  FolderOpen,
  Folder,
} from "lucide-react";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/category.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

type Cat = {
  id: number;
  name: string;
  slug: string;
  depth: number;
  parentId: number | null;
  isActive: boolean;
  description: string | null;
  parent?: { id: number; name: string } | null;
  _count?: { products: number; children: number };
  children?: Cat[];
};

/* ── Build tree from flat list ─────────────────────────────── */
function buildTree(flat: Cat[]): Cat[] {
  const map = new Map<number, Cat>();
  const roots: Cat[] = [];

  flat.forEach((c) => map.set(c.id, { ...c, children: [] }));

  flat.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/* ── Depth styling helpers ─────────────────────────────────── */
const DEPTH_COLORS = [
  "border-primary/30 bg-primary-pale/40",
  "border-blue-200  bg-blue-50/40",
  "border-purple-200 bg-purple-50/40",
  "border-amber-200 bg-amber-50/40",
];

const DEPTH_INDENT = ["pl-0", "pl-6", "pl-12", "pl-18"];

/* ── Category Modal ────────────────────────────────────────── */
function CategoryModal({
  cat,
  allFlat,
  onClose,
  onSaved,
}: {
  cat?: Cat;
  allFlat: Cat[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(cat?.name ?? "");
  const [desc, setDesc] = useState(cat?.description ?? "");
  const [parentId, setParentId] = useState<string>(
    cat?.parentId ? String(cat.parentId) : "",
  );
  const [isActive, setIsActive] = useState(cat?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  /* Only allow selecting as parent if depth < 3 */
  const parentOptions = allFlat.filter((c) => c.id !== cat?.id && c.depth < 3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    const fd = new FormData();
    fd.append(
      "data",
      JSON.stringify({
        name,
        description: desc || undefined,
        parentId: parentId ? Number(parentId) : undefined,
        isActive,
      }),
    );

    const res = cat
      ? await updateCategory(cat.id, fd)
      : await createCategory(fd);

    if (res?.success) {
      toast.success(cat ? "Category updated!" : "Category created!");
      onSaved();
    } else {
      toast.error((res as any)?.message ?? "Failed");
    }
    setSaving(false);
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none " +
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
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md
                   bg-white rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {cat ? "Edit" : "New"} Category
            </h3>
            {cat && (
              <p className="text-xs text-gray-400 mt-0.5">
                Depth level {cat.depth} · {cat._count?.products ?? 0} products
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Electronics"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Parent Category
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className={`${inputCls} bg-white`}
            >
              <option value="">— Root category —</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {"  ".repeat(p.depth)}
                  {p.depth > 0 ? "↳ " : ""}
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Optional description..."
              className={`${inputCls} resize-none`}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsActive(!isActive)}
              className={cn(
                "w-10 h-5 rounded-full relative transition-colors",
                isActive ? "bg-primary" : "bg-gray-300",
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                  isActive ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </div>
            <span className="text-sm text-gray-700">Active</span>
          </label>

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

/* ── Tree Node ─────────────────────────────────────────────── */
function CategoryNode({
  node,
  allFlat,
  onEdit,
  onDelete,
  defaultOpen = true,
}: {
  node: Cat;
  allFlat: Cat[];
  onEdit: (c: Cat) => void;
  onDelete: (c: Cat) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const depthColor =
    DEPTH_COLORS[Math.min(node.depth, DEPTH_COLORS.length - 1)];

  return (
    <div
      className={cn(
        "rounded-2xl border",
        depthColor,
        node.depth > 0 ? "ml-6 mt-2" : "mt-3",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Expand toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0",
            hasChildren
              ? "hover:bg-white/60 text-gray-500"
              : "text-transparent cursor-default",
          )}
        >
          {hasChildren ? (
            open ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : null}
        </button>

        {/* Icon */}
        <div
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
            node.depth === 0 ? "bg-primary/10" : "bg-white/70",
          )}
        >
          {hasChildren ? (
            <FolderOpen
              size={15}
              className={node.depth === 0 ? "text-primary" : "text-gray-400"}
            />
          ) : (
            <Folder size={15} className="text-gray-300" />
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">{node.name}</p>
            {!node.isActive && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                Inactive
              </span>
            )}
            {node.depth === 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Root
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">
            {node._count?.products ?? 0} products
            {hasChildren && ` · ${node.children!.length} sub-categories`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-gray-300 mr-1">L{node.depth}</span>
          <button
            onClick={() => onEdit(node)}
            className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-white/70 transition-all"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(node)}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Children */}
      <AnimatePresence>
        {open && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-3 pb-3"
          >
            {node.children!.map((child) => (
              <CategoryNode
                key={child.id}
                node={child}
                allFlat={allFlat}
                onEdit={onEdit}
                onDelete={onDelete}
                defaultOpen={false}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function AdminCategoriesPage() {
  const [allFlat, setAllFlat] = useState<Cat[]>([]);
  const [tree, setTree] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; cat?: Cat }>({
    open: false,
  });
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await getAllCategories({ limit: 200 });
    if (res?.success) {
      const flat: Cat[] = res.data?.categories ?? res.data ?? [];
      setAllFlat(flat);
      setTree(buildTree(flat));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  /* client-side search — filter flat, rebuild tree */
  const filteredTree = search.trim()
    ? buildTree(
        allFlat.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase()),
        ),
      )
    : tree;

  const handleDelete = async (cat: Cat) => {
    const childCount = cat._count?.children ?? 0;
    const productCount = cat._count?.products ?? 0;

    if (childCount > 0) {
      toast.error("Delete sub-categories first before deleting this category.");
      return;
    }
    if (productCount > 0) {
      toast.error("Remove or reassign products before deleting.");
      return;
    }
    if (!confirm(`Delete "${cat.name}"?`)) return;

    const res = await deleteCategory(cat.id);
    if (res?.success || res === "") {
      toast.success("Deleted");
      load();
    } else {
      toast.error((res as any)?.message ?? "Failed");
    }
  };

  // Stats
  const rootCount = allFlat.filter((c) => c.depth === 0).length;
  const subCount = allFlat.filter((c) => c.depth > 0).length;
  const totalProds = allFlat.reduce((s, c) => s + (c._count?.products ?? 0), 0);

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Categories
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {rootCount} root · {subCount} sub · {totalProds} products
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus size={15} /> Add Category
        </button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search categories..."
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm
                   outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Root (L0)", color: "border-primary/30 bg-primary-pale/40" },
          {
            label: "Sub-category (L1)",
            color: "border-blue-200  bg-blue-50/40",
          },
          { label: "Level 2", color: "border-purple-200 bg-purple-50/40" },
          { label: "Level 3", color: "border-amber-200  bg-amber-50/40" },
        ].map(({ label, color }) => (
          <span
            key={label}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border font-medium text-gray-600",
              color,
            )}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Tree */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-14 rounded-2xl" />
          ))}
        </div>
      ) : filteredTree.length === 0 ? (
        <div className="card p-12 text-center">
          <Layers size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">
            {search ? "No categories match your search." : "No categories yet."}
          </p>
        </div>
      ) : (
        <div>
          {filteredTree.map((root) => (
            <CategoryNode
              key={root.id}
              node={root}
              allFlat={allFlat}
              onEdit={(cat) => setModal({ open: true, cat })}
              onDelete={handleDelete}
              defaultOpen={true}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal.open && (
          <CategoryModal
            cat={modal.cat}
            allFlat={allFlat}
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
