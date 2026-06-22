/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* ─── Flash Sale Items Modal ──────────────────────────────────── */
import {
  getFlashSaleBySlug,
  addFlashSaleItems,
  removeFlashSaleItem,
  updateFlashSaleItem,
} from "@/services/flashSale.service";
import { fetchWithAuth } from "@/services/helpers"; // or use your product service
import { formatBDT } from "@/lib/utils/currency";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Search, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

export function FlashSaleItemsModal({
  sale,
  onClose,
}: {
  sale: { publicId: string; slug: string; title: string; status: string };
  onClose: () => void;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [discount, setDiscount] = useState({
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FLAT",
    discountValue: "",
    maxDiscount: "",
    stock: "",
  });
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const isEditable = !["ENDED", "CANCELLED"].includes(sale.status);

  // Load current items
  const loadItems = async () => {
    setLoadingItems(true);
    const res = await getFlashSaleBySlug(sale.slug);
    if (res?.success) setItems(res.data?.items ?? []);
    setLoadingItems(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Debounced product search
  useEffect(() => {
    if (!productSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        // Adjust this endpoint to match your products route
        const res = await fetchWithAuth(
          `/products?search=${encodeURIComponent(
            productSearch,
          )}&status=ACTIVE&limit=8`,
        );
        setSearchResults(res?.data?.products ?? res?.data ?? []);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [productSearch]);

  const handleAdd = async () => {
    if (!selected || !discount.discountValue) {
      toast.error("Select a product and enter discount value");
      return;
    }
    setAdding(true);
    const fd = new FormData();
    fd.append(
      "data",
      JSON.stringify({
        items: [
          {
            productId: selected.id,
            discountType: discount.discountType,
            discountValue: Number(discount.discountValue),
            ...(discount.maxDiscount && {
              maxDiscount: Number(discount.maxDiscount),
            }),
            ...(discount.stock && { stock: Number(discount.stock) }),
          },
        ],
      }),
    );
    const res = await addFlashSaleItems(sale.publicId, fd);
    if (res?.success) {
      toast.success(`Added ${res.data?.addedCount ?? 1} item(s)`);
      if ((res.data?.skippedCount ?? 0) > 0) {
        res.data?.skipped?.forEach((s: any) => toast.warning(s.reason));
      }
      setSelected(null);
      setProductSearch("");
      setDiscount({
        discountType: "PERCENTAGE",
        discountValue: "",
        maxDiscount: "",
        stock: "",
      });
      loadItems();
    } else {
      toast.error((res as any)?.message ?? "Failed to add");
    }
    setAdding(false);
  };

  const handleRemove = async (itemPublicId: string) => {
    if (!confirm("Remove this product from the sale?")) return;
    setRemoving(itemPublicId);
    const res = await removeFlashSaleItem(itemPublicId);
    if (res?.success || typeof res === "string") {
      toast.success("Removed");
      loadItems();
    } else {
      toast.error((res as any)?.message ?? "Failed");
    }
    setRemoving(null);
  };

  const handleToggleItem = async (item: any) => {
    const fd = new FormData();
    fd.append("data", JSON.stringify({ isActive: !item.isActive }));
    const res = await updateFlashSaleItem(item.publicId, fd);
    if (res?.success) {
      toast.success(item.isActive ? "Item deactivated" : "Item activated");
      loadItems();
    } else toast.error((res as any)?.message ?? "Failed");
  };

  const inp =
    "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none " +
    "focus:border-primary focus:ring-2 focus:ring-primary/20";

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
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-50
                   flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">{sale.title}</h3>
            <p className="text-xs text-gray-400">
              Manage products · {items.length} items
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Current Items */}
          <div className="p-5 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Current Items
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({items.length})
              </span>
            </h4>

            {loadingItems ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-14 rounded-xl" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No products yet. Add some below.
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all",
                      item.isActive
                        ? "border-gray-100 bg-gray-50"
                        : "border-gray-100 bg-gray-50 opacity-50",
                    )}
                  >
                    {/* Product image */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-primary-pale shrink-0">
                      {item.product?.images?.[0]?.url ? (
                        <Image
                          src={item.product.images[0].url}
                          alt=""
                          className="w-full h-full object-cover"
                          height={400}
                          width={400}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={14} className="text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.discountType === "PERCENTAGE"
                          ? `${Number(item.discountValue)}% off`
                          : `৳${Number(item.discountValue)} off`}
                        {" · "}Sale: {formatBDT(Number(item.salePrice))}
                        {item.stock !== null && ` · Stock: ${item.stock}`}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {sale.status === "ACTIVE" ? (
                        // ACTIVE: can only toggle, not delete
                        <button
                          onClick={() => handleToggleItem(item)}
                          className={cn(
                            "text-xs px-2 py-1 rounded-lg border transition-colors",
                            item.isActive
                              ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                              : "border-green-200 text-green-600 hover:bg-green-50",
                          )}
                        >
                          {item.isActive ? "Pause" : "Activate"}
                        </button>
                      ) : isEditable ? (
                        // DRAFT: can delete
                        <button
                          onClick={() => handleRemove(item.publicId)}
                          disabled={removing === item.publicId}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-40"
                        >
                          <Trash2 size={13} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Products — only for editable sales */}
          {isEditable && (
            <div className="p-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Add Products
              </h4>

              {/* Search */}
              <div className="relative mb-3">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setSelected(null);
                  }}
                  placeholder="Search products by name..."
                  className={`${inp} pl-9`}
                />
                {searching && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5
                               border-2 border-gray-200 border-t-primary rounded-full"
                  />
                )}
              </div>

              {/* Search results dropdown */}
              {searchResults.length > 0 && !selected && (
                <div className="border border-gray-100 rounded-xl overflow-hidden mb-3 shadow-sm">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelected(p);
                        setProductSearch(p.name);
                        setSearchResults([]);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary-pale
                                 transition-colors text-left border-b border-gray-50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {p.images?.[0]?.url ? (
                          <Image
                            src={p.images[0].url}
                            alt=""
                            className="w-full h-full object-cover"
                            height={400}
                            width={400}
                          />
                        ) : (
                          <Package
                            size={12}
                            className="m-auto text-gray-300 mt-1.5"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {p.variants?.[0]?.price
                            ? formatBDT(Number(p.variants[0].price))
                            : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Discount form — shows when product selected */}
              {selected && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {selected.name}
                    </p>
                    <button
                      onClick={() => {
                        setSelected(null);
                        setProductSearch("");
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Discount Type
                      </label>
                      <select
                        value={discount.discountType}
                        onChange={(e) =>
                          setDiscount((d) => ({
                            ...d,
                            discountType: e.target.value as any,
                          }))
                        }
                        className={`${inp} bg-white text-xs py-2`}
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FLAT">Flat (৳)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Value{" "}
                        {discount.discountType === "PERCENTAGE" ? "(%)" : "(৳)"}{" "}
                        *
                      </label>
                      <input
                        type="number"
                        value={discount.discountValue}
                        onChange={(e) =>
                          setDiscount((d) => ({
                            ...d,
                            discountValue: e.target.value,
                          }))
                        }
                        placeholder={
                          discount.discountType === "PERCENTAGE" ? "20" : "100"
                        }
                        min={0}
                        max={
                          discount.discountType === "PERCENTAGE"
                            ? 100
                            : undefined
                        }
                        className={`${inp} text-xs py-2`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {discount.discountType === "PERCENTAGE" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Max Discount (৳)
                        </label>
                        <input
                          type="number"
                          value={discount.maxDiscount}
                          onChange={(e) =>
                            setDiscount((d) => ({
                              ...d,
                              maxDiscount: e.target.value,
                            }))
                          }
                          placeholder="Optional cap"
                          min={0}
                          className={`${inp} text-xs py-2`}
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Sale Stock Limit
                      </label>
                      <input
                        type="number"
                        value={discount.stock}
                        onChange={(e) =>
                          setDiscount((d) => ({ ...d, stock: e.target.value }))
                        }
                        placeholder="∞ (all stock)"
                        min={1}
                        className={`${inp} text-xs py-2`}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAdd}
                    disabled={adding}
                    className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {adding ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <Plus size={14} />
                    )}
                    {adding ? "Adding..." : "Add to Flash Sale"}
                  </button>
                </motion.div>
              )}

              {/* Tips */}
              {!selected && !productSearch && (
                <div className="bg-primary-pale/50 rounded-xl p-3 text-xs text-gray-500">
                  <p className="font-medium text-primary mb-1">Tips</p>
                  <p>
                    • Each product can only appear in one flash sale at a time
                  </p>
                  <p>• You can add products to both DRAFT and ACTIVE sales</p>
                  {sale.status === "ACTIVE" && (
                    <p className="text-orange-600">
                      • Items can only be paused (not removed) in active sales
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
