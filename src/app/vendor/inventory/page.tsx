/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import {
  getLowStockVariants,
  getOutOfStockVariants,
} from "@/services/inventory.service";
import { updateStock } from "@/services/product.service";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

type Tab = "LOW_STOCK" | "OUT_OF_STOCK";

export default function VendorInventoryPage() {
  const [tab, setTab] = useState<Tab>("LOW_STOCK");
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockAdj, setStockAdj] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true);
    const res =
      tab === "LOW_STOCK"
        ? await getLowStockVariants({ limit: 50, threshold: 10 })
        : await getOutOfStockVariants({ limit: 50 });
    if (res?.success) setVariants(res.data?.variants ?? res.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [tab]);

  const handleRestock = async (variant: any) => {
    const change = Number(stockAdj[variant.id] ?? 0);
    if (!change || change <= 0) {
      toast.error("Enter a positive quantity");
      return;
    }
    const fd = new FormData();
    fd.append("data", JSON.stringify({ change, reason: "RESTOCK" }));
    const res = await updateStock(variant.product?.id, variant.id, fd);
    if (res?.success) {
      toast.success(`+${change} stock added`);
      setStockAdj((prev) => ({ ...prev, [variant.id]: "" }));
      load();
    } else {
      toast.error((res as any)?.message ?? "Failed");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Inventory
        </h2>
        <button
          onClick={load}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        {(["LOW_STOCK", "OUT_OF_STOCK"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              tab === t
                ? "bg-primary text-white shadow-pink"
                : "bg-white border border-gray-200 text-gray-600 hover:border-primary",
            )}
          >
            {t === "LOW_STOCK" ? "⚠️ Low Stock" : "❌ Out of Stock"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : variants.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center gap-3">
          <AlertTriangle size={48} className="text-gray-200" />
          <p className="text-gray-500">
            {tab === "LOW_STOCK"
              ? "No low-stock items 🎉"
              : "No out-of-stock items 🎉"}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Product", "SKU", "Stock", "Restock", "Last Updated"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-500 px-4 py-3"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <motion.tr
                  key={v.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {v.product?.images?.[0]?.url && (
                        <img
                          src={v.product.images[0].url}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                      )}
                      <p className="text-sm font-medium text-gray-900 max-w-[160px] truncate">
                        {v.product?.name ?? "—"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-gray-500">
                      {v.sku}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-sm font-bold",
                        v.stock === 0 ? "text-red-500" : "text-amber-500",
                      )}
                    >
                      {v.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={stockAdj[v.id] ?? ""}
                        onChange={(e) =>
                          setStockAdj((prev) => ({
                            ...prev,
                            [v.id]: e.target.value,
                          }))
                        }
                        placeholder="Qty"
                        className="w-20 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => handleRestock(v)}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:brightness-105 transition-all"
                      >
                        Add
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400">
                      {v.updatedAt ? formatDate(v.updatedAt) : "—"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
