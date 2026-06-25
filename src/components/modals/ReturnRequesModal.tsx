/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { createReturnRequest } from "@/services/returnRequest.service";

interface ReturnModalProps {
  orderId: number;
  items: Array<{
    id: number;
    productName: string;
    variantName?: string;
    maxQuantity: number;
  }>;
  onClose: () => void;
  onSuccess: () => void;
}

const RETURN_REASONS = [
  "DAMAGED",
  "WRONG_ITEM",
  "NOT_AS_DESCRIBED",
  "CHANGED_MIND",
  "OTHER",
] as const;

export function ReturnModal({
  orderId,
  items,
  onClose,
  onSuccess,
}: ReturnModalProps) {
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>(
    {},
  );
  const [reason, setReason] = useState<(typeof RETURN_REASONS)[number] | "">(
    "",
  );
  const [description, setDescription] = useState("");
  const [refundMethod, setRefundMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const handleItemChange = (itemId: number, quantity: number) => {
    setSelectedItems((prev) => {
      if (quantity <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: quantity };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const itemEntries = Object.entries(selectedItems).map(([id, qty]) => ({
      orderItemId: Number(id),
      quantity: qty,
    }));

    if (itemEntries.length === 0) {
      toast.error("Please select at least one item to return");
      return;
    }
    if (!reason) {
      toast.error("Please select a return reason");
      return;
    }

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        orderId,
        items: itemEntries,
        reason,
        description: description.trim() || undefined,
        requestedMeansOfRefund: refundMethod.trim() || undefined,
      }),
    );

    setLoading(true);
    try {
      const res = await createReturnRequest(formData);
      if (res?.success) {
        toast.success("Return request submitted successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(res?.message || "Failed to submit return request");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
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
        className="fixed inset-4 z-50 mx-auto max-w-md bg-white rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl font-bold text-gray-900">
            Return Items
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Items selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select items to return
            </label>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl"
                >
                  <input
                    type="number"
                    min={1}
                    max={item.maxQuantity}
                    value={selectedItems[item.id] || 0}
                    onChange={(e) =>
                      handleItemChange(item.id, parseInt(e.target.value) || 0)
                    }
                    className="w-16 px-2 py-1 border rounded-lg text-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.productName}
                    </p>
                    {item.variantName && (
                      <p className="text-xs text-gray-500">
                        {item.variantName}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    Max: {item.maxQuantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reason for return *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="">Select a reason</option>
              {RETURN_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ").toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Please describe the issue in detail..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Refund method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Preferred Refund Method (Optional)
            </label>
            <input
              type="text"
              value={refundMethod}
              onChange={(e) => setRefundMethod(e.target.value)}
              placeholder="e.g., Bank transfer, Store credit"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Submit Return"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
