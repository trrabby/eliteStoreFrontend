/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw, ChevronDown } from "lucide-react";
import { getMyReturnRequests } from "@/services/returnRequest.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  APPROVED: "bg-blue-50   text-blue-700",
  REJECTED: "bg-red-50    text-red-700",
  COMPLETED: "bg-green-50  text-green-700",
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await getMyReturnRequests({ limit: 20 });
      // console.log(res);
      if (res?.success) setReturns(res.data.requests ?? []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-bold text-gray-900">
        Return Requests
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : returns.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center gap-3">
          <RotateCcw size={48} className="text-gray-200" />
          <p className="text-gray-500">No return requests yet.</p>
          <p className="text-sm text-gray-400">
            You can request a return from your delivered orders.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {returns?.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      Order #{req.order?.orderNumber}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        STATUS_COLORS[req.status] ?? "bg-gray-50 text-gray-600",
                      )}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Reason: {req.reason?.replace("_", " ")}
                  </p>
                  {req.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {req.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {req.createdAt ? formatDate(req.createdAt) : ""}
                  </p>
                </div>
                {req.refundAmount && (
                  <span className="text-sm font-bold text-green-600 shrink-0">
                    Refund: {formatBDT(req.refundAmount)}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
