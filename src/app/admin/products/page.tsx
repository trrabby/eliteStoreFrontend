/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Package,
} from "lucide-react";
import {
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "@/services/product.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Image from "next/image";

const STATUS_OPTS = [
  "ALL",
  "ACTIVE",
  "DRAFT",
  "OUT_OF_STOCK",
  "ARCHIVED",
  "DISCONTINUED",
];

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  DRAFT: "bg-gray-50 text-gray-600",
  OUT_OF_STOCK: "bg-red-50 text-red-600",
  ARCHIVED: "bg-yellow-50 text-yellow-700",
  DISCONTINUED: "bg-orange-50 text-orange-700",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 15;

  const load = async () => {
    setLoading(true);
    const res = await getAllProducts({
      page,
      limit,
      status: status === "ALL" ? undefined : status,
      search: search || undefined,
    });
    if (res?.success) {
      setProducts(res.data?.products ?? res.data ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [status, page]);

  const handleStatusToggle = async (id: number, current: string) => {
    const next = current === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
    if (!confirm(`Set product to ${next}?`)) return;
    const fd = new FormData();
    fd.append("data", JSON.stringify({ status: next }));
    const res = await updateProduct(id, fd);
    if (res?.success) {
      toast.success(`Product ${next.toLowerCase()}`);
      load();
    } else toast.error("Failed");
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Permanently delete "${name}"?`)) return;
    const res = await deleteProduct(id);
    if (res?.success || res === "") {
      toast.success("Deleted");
      load();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-bold text-gray-900">
        All Products
      </h2>

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
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary"
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

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-center">
            <Package size={48} className="text-gray-200" />
            <p className="text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {[
                    "Product",
                    "Vendor",
                    "Price",
                    "Stock",
                    "Status",
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
                {products.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-pale overflow-hidden shrink-0">
                          {p.images?.[0]?.url && (
                            <Image
                              src={p.images[0].url}
                              alt=""
                              className="w-full h-full object-cover"
                              width={40}
                              height={40}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-45">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {p.variants?.length ?? 0} variants
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Vendor */}
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {p.vendor?.storeName ?? "—"}
                    </td>
                    {/* Price */}
                    <td className="px-4 py-3 text-sm font-bold text-primary">
                      {formatBDT(p.variants?.[0]?.price ?? 0)}
                    </td>
                    {/* Stock */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-sm font-semibold",
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
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          STATUS_COLOR[p.status] ?? "bg-gray-50 text-gray-600",
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(p.createdAt)}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-primary-pale transition-all"
                          title="View live"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          onClick={() => handleStatusToggle(p.id, p.status)}
                          className={cn(
                            "p-1.5 rounded-lg transition-all",
                            p.status === "ACTIVE"
                              ? "text-green-500 hover:bg-green-50"
                              : "text-gray-300 hover:text-green-500 hover:bg-green-50",
                          )}
                          title={
                            p.status === "ACTIVE" ? "Deactivate" : "Activate"
                          }
                        >
                          {p.status === "ACTIVE" ? (
                            <ToggleRight size={18} />
                          ) : (
                            <ToggleLeft size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                          title="Delete"
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
        )}

        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {total} products total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40 hover:border-primary"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs text-gray-500">
                {page} / {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / limit)}
                className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40 hover:border-primary"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
