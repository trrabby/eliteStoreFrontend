/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2, Package, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import {
  addFlashSaleItems,
  removeFlashSaleItem,
  updateFlashSaleItem,
} from "@/services/flashSale.service";
import { getMyProducts } from "@/services/product.service";
import Image from "next/image";

interface FlashSaleItemsModalProps {
  sale: any; // flash sale object
  onClose: () => void;
}

export function FlashSaleItemsModal({
  sale,
  onClose,
}: FlashSaleItemsModalProps) {
  const [items, setItems] = useState<any[]>(sale.items || []);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);

  // Bulk selection state
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [bulkDiscountType, setBulkDiscountType] = useState<
    "PERCENTAGE" | "FLAT"
  >("PERCENTAGE");
  const [bulkDiscountValue, setBulkDiscountValue] = useState<number>(10);
  const [bulkMaxDiscount, setBulkMaxDiscount] = useState<number | "">("");
  const [bulkStock, setBulkStock] = useState<number | "">("");

  // Load vendor products (only those not already in the sale)
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await getMyProducts({ limit: 100 });
        if (res?.success) {
          const existingIds = new Set(items.map((i) => i.productId));
          const available = res.data?.products.filter(
            (p: any) => !existingIds.has(p.id),
          );
          setAllProducts(available || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, [items]);

  // ── ADD BULK with FormData ────────────────────────────────
  const handleAddBulk = async () => {
    if (selectedProductIds.length === 0) {
      toast.error("Select at least one product");
      return;
    }
    if (!bulkDiscountValue || bulkDiscountValue <= 0) {
      toast.error("Enter a valid discount value");
      return;
    }
    if (bulkStock !== "" && (bulkStock as number) < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    const newItems = selectedProductIds.map((productId) => ({
      productId,
      discountType: bulkDiscountType,
      discountValue: bulkDiscountValue,
      maxDiscount: bulkMaxDiscount === "" ? undefined : Number(bulkMaxDiscount),
      stock: bulkStock === "" ? undefined : Number(bulkStock),
    }));

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ items: newItems }));

      const res = await addFlashSaleItems(sale.publicId, formData);
      if (res?.success) {
        toast.success(`Added ${newItems.length} item(s)`);
        // Refresh items list – ideally we would refetch the sale, but we'll merge
        const updatedItems = [
          ...items,
          ...newItems.map((item, idx) => ({
            ...item,
            id: `temp-${Date.now()}-${idx}`, // will be replaced by server ID on refetch
            product: allProducts.find((p) => p.id === item.productId),
          })),
        ];
        setItems(updatedItems);
        // Reset selection
        setSelectedProductIds([]);
        setBulkDiscountValue(10);
        setBulkMaxDiscount("");
        setBulkStock("");
      } else {
        toast.error((res as any)?.message || "Failed to add items");
      }
    } catch (error) {
      toast.error("Error adding items");
    } finally {
      setSaving(false);
    }
  };

  // ── REMOVE ITEM ────────────────────────────────────────────
  const handleRemoveItem = async (itemPublicId: string) => {
    if (!confirm("Remove this item?")) return;
    try {
      const res = await removeFlashSaleItem(itemPublicId);
      if (res?.success || typeof res === "string") {
        toast.success("Item removed");
        setItems(items.filter((i) => i.publicId !== itemPublicId));
      } else {
        toast.error((res as any)?.message || "Failed");
      }
    } catch (error) {
      toast.error("Error removing item");
    }
  };

  // ── UPDATE ITEM ────────────────────────────────────────────
  const handleUpdateItem = async (itemPublicId: string, updates: any) => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(updates));

      const res = await updateFlashSaleItem(itemPublicId, formData);
      if (res?.success) {
        // Update local state – we need to update the item in the list
        setItems(
          items.map((i) =>
            i.publicId === itemPublicId ? { ...i, ...updates } : i,
          ),
        );
        toast.success("Updated");
      } else {
        toast.error((res as any)?.message || "Failed to update");
      }
    } catch (error) {
      toast.error("Error updating item");
    }
  };

  // ── TOGGLE SELECTION ───────────────────────────────────────
  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

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
        className="fixed inset-4 z-50 mx-auto max-w-4xl bg-white rounded-3xl p-6 shadow-2xl overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-6 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-semibold text-xl text-gray-900">
              Manage Items — {sale.title}
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              {items.length} product{items.length !== 1 ? "s" : ""} added
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Existing items */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Added Items
          </h4>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
              <Package size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No items added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id || item.publicId}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0">
                    {item.product?.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product?.name || "Product"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <select
                        value={item.discountType}
                        onChange={(e) =>
                          handleUpdateItem(item.publicId, {
                            discountType: e.target.value,
                          })
                        }
                        className="text-xs border rounded-lg px-2 py-1 bg-white"
                      >
                        <option value="PERCENTAGE">%</option>
                        <option value="FLAT">Flat</option>
                      </select>
                      <input
                        type="number"
                        value={item.discountValue}
                        onChange={(e) =>
                          handleUpdateItem(item.publicId, {
                            discountValue: parseFloat(e.target.value),
                          })
                        }
                        className="w-16 text-xs border rounded-lg px-2 py-1 bg-white"
                        min="0"
                      />
                      {item.discountType === "PERCENTAGE" && (
                        <>
                          <span className="text-xs text-gray-400">max</span>
                          <input
                            type="number"
                            value={item.maxDiscount ?? ""}
                            onChange={(e) =>
                              handleUpdateItem(item.publicId, {
                                maxDiscount: e.target.value
                                  ? parseFloat(e.target.value)
                                  : null,
                              })
                            }
                            className="w-16 text-xs border rounded-lg px-2 py-1 bg-white"
                            min="0"
                            placeholder="∞"
                          />
                        </>
                      )}
                      <span className="text-xs text-gray-400">stock</span>
                      <input
                        type="number"
                        value={item.stock ?? ""}
                        onChange={(e) =>
                          handleUpdateItem(item.publicId, {
                            stock: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          })
                        }
                        className="w-16 text-xs border rounded-lg px-2 py-1 bg-white"
                        min="0"
                        placeholder="∞"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.publicId)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add new items - bulk selection */}
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Add Products in Bulk
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Discount Type
              </label>
              <select
                value={bulkDiscountType}
                onChange={(e) => setBulkDiscountType(e.target.value as any)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FLAT">Flat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Value</label>
              <input
                type="number"
                value={bulkDiscountValue}
                onChange={(e) =>
                  setBulkDiscountValue(parseFloat(e.target.value) || 0)
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                min="0"
              />
            </div>
            {bulkDiscountType === "PERCENTAGE" && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Max Discount (optional)
                </label>
                <input
                  type="number"
                  value={bulkMaxDiscount}
                  onChange={(e) =>
                    setBulkMaxDiscount(
                      e.target.value ? parseFloat(e.target.value) : "",
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  min="0"
                  placeholder="No limit"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Stock (optional)
              </label>
              <input
                type="number"
                value={bulkStock}
                onChange={(e) =>
                  setBulkStock(e.target.value ? parseInt(e.target.value) : "")
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                min="0"
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">
                Select products to add ({selectedProductIds.length} selected)
              </span>
              {selectedProductIds.length > 0 && (
                <button
                  onClick={() => setSelectedProductIds([])}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear all
                </button>
              )}
            </div>
            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-12 rounded-lg" />
                ))}
              </div>
            ) : allProducts.length === 0 ? (
              <p className="text-sm text-gray-400">
                No more products available to add.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
                {allProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => toggleProductSelection(product.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-gray-200 hover:border-gray-300",
                      )}
                    >
                      <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                        {product.images?.[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            height={40}
                            width={40}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={12} />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium truncate">
                        {product.name}
                      </span>
                      {isSelected && (
                        <Check
                          size={12}
                          className="text-primary shrink-0 ml-auto"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
            <button
              onClick={handleAddBulk}
              disabled={saving || selectedProductIds.length === 0}
              className="btn-primary px-6 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
            >
              <Plus size={14} />
              {saving ? "Adding..." : "Add Selected"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
