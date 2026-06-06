/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Package,
  Trash,
} from "lucide-react";
import { getMyProducts, deleteProduct } from "@/services/product.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Image from "next/image";

const STATUS_OPTS = ["ALL", "ACTIVE", "DRAFT", "OUT_OF_STOCK", "ARCHIVED"];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-50  text-green-700",
  DRAFT: "bg-gray-50   text-gray-600",
  OUT_OF_STOCK: "bg-red-50    text-red-600",
  ARCHIVED: "bg-yellow-50 text-yellow-700",
  DISCONTINUED: "bg-orange-50 text-orange-700",
};

export default function VendorProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(
    new Set(),
  );
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const limit = 12;

  const load = async () => {
    setLoading(true);
    const res = await getMyProducts({
      page,
      limit,
      status: status === "ALL" ? undefined : status,
    });
    if (res?.success) {
      setProducts(res.data?.products ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [status, page]);

  // Clear selections when filters change
  useEffect(() => {
    setSelectedProducts(new Set());
  }, [status, page, search]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await deleteProduct(id);
    if (res?.success || typeof res === "string") {
      toast.success("Product deleted");
      load();
      setSelectedProducts((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      toast.error((res as any)?.message ?? "Failed to delete");
    }
  };

  const handleBulkDelete = async () => {
    const productIds = Array.from(selectedProducts);
    if (productIds.length === 0) return;

    const productNames = products
      .filter((p) => selectedProducts.has(p.id))
      .map((p) => p.name)
      .join(", ");

    if (
      !confirm(
        `Delete ${productIds.length} product(s)?\n\n${productNames}\n\nThis cannot be undone.`,
      )
    )
      return;

    setBulkDeleting(true);

    // For now, just console log the array of product ids
    console.log("Bulk delete product IDs:", productIds);
    toast.info(
      `Bulk delete would remove ${productIds.length} product(s). Check console for IDs.`,
    );

    // When you implement the actual bulk delete API, uncomment this:
    // try {
    //   const results = await Promise.allSettled(
    //     productIds.map(id => deleteProduct(id))
    //   );
    //   const succeeded = results.filter(r => r.status === 'fulfilled' && (r.value?.success || typeof r.value === "string")).length;
    //   const failed = results.length - succeeded;
    //
    //   if (succeeded > 0) {
    //     toast.success(`${succeeded} product(s) deleted successfully`);
    //   }
    //   if (failed > 0) {
    //     toast.error(`${failed} product(s) failed to delete`);
    //   }
    //   load();
    //   setSelectedProducts(new Set());
    // } catch (error) {
    //   toast.error("Failed to delete products");
    // } finally {
    //   setBulkDeleting(false);
    // }

    setBulkDeleting(false);
  };

  const toggleSelectAll = () => {
    const currentProducts = filtered;
    if (selectedProducts.size === currentProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(currentProducts.map((p) => p.id)));
    }
  };

  const toggleSelectProduct = (id: number) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filtered = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      )
    : products;

  const isAllSelected =
    filtered.length > 0 && selectedProducts.size === filtered.length;
  const isSomeSelected =
    selectedProducts.size > 0 && selectedProducts.size < filtered.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-gray-900">
          My Products
        </h2>
        <Link
          href="/vendor/products/create"
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus size={15} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {STATUS_OPTS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={cn(
                "shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                status === s
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary",
              )}
            >
              {s === "ALL" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 rounded-xl p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900">
              {selectedProducts.size} product(s) selected
            </span>
            <button
              onClick={() => setSelectedProducts(new Set())}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash size={14} />
            {bulkDeleting ? "Deleting..." : "Delete Selected"}
          </button>
        </motion.div>
      )}

      {/* Products table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center gap-3">
          <Package size={48} className="text-gray-200" />
          <p className="text-gray-500">No products found.</p>
          <Link
            href="/vendor/products/create"
            className="btn-primary px-6 py-2.5 text-sm"
          >
            Create First Product
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {/* Checkbox column */}
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = isSomeSelected;
                        }
                      }}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                  </th>
                  {[
                    "Product",
                    "Status",
                    "Price",
                    "Stock",
                    "Sales",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-500 px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors",
                      selectedProducts.has(p.id) && "bg-primary/5",
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(p.id)}
                        onChange={() => toggleSelectProduct(p.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary/20"
                      />
                    </td>
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-primary-pale shrink-0">
                          {p.images?.[0]?.url && (
                            <Image
                              src={p.images[0].url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              fill
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-45">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {p.variants?.length ?? 0} variant(s)
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          STATUS_COLORS[p.status] ?? "bg-gray-50 text-gray-600",
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                    {/* Price */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-primary">
                        {formatBDT(p.variants?.[0]?.price ?? 0)}
                      </span>
                    </td>
                    {/* Stock */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          (p.variants?.[0]?.stock ?? 0) === 0
                            ? "text-red-500"
                            : (p.variants?.[0]?.stock ?? 0) < 10
                            ? "text-amber-500"
                            : "text-green-600",
                        )}
                      >
                        {p.variants?.[0]?.stock ?? 0}
                      </span>
                    </td>
                    {/* Sales */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {p._count?.orderItems ?? 0}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">
                        {p.createdAt ? formatDate(p.createdAt) : "—"}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          title="Preview"
                          className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/vendor/products/${p.id}/edit`}
                          title="Edit"
                          className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          title="Delete"
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {total} products total
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs disabled:opacity-40 hover:border-primary"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-xs text-gray-500">
                  {page} / {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs disabled:opacity-40 hover:border-primary"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
