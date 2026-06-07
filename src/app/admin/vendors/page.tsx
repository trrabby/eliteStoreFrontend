/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { getAllVendors, verifyVendor } from "@/services/vendor.service";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

const TABS = ["ALL", "PENDING", "VERIFIED", "REJECTED"];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  const load = async () => {
    setLoading(true);
    const params: any = { page, limit };
    if (tab === "PENDING") params.isVerified = false;
    if (tab === "VERIFIED") params.isVerified = true;
    if (search) params.search = search;
    const res = await getAllVendors(params);
    if (res?.success) {
      setVendors(res.data?.vendors ?? res.data ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [tab, page]);

  const handleVerify = async (publicId: string, name: string) => {
    if (!confirm(`Verify "${name}"?`)) return;
    const res = await verifyVendor(publicId);
    if (res?.success) {
      toast.success("Vendor verified!");
      load();
    } else toast.error("Failed");
  };

  const handleReject = async (publicId: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    const fd = new FormData();
    fd.append("data", JSON.stringify({ reason }));
    const res = await rejectVendor(publicId, fd);
    if (res?.success) {
      toast.success("Vendor rejected");
      load();
    } else toast.error("Failed");
  };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-bold text-gray-900">Vendors</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search vendors..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setPage(1);
              }}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium transition-all",
                tab === t
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No vendors found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {[
                    "Store",
                    "Owner",
                    "Sales",
                    "Status",
                    "Joined",
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
                {vendors.map((v, i) => (
                  <motion.tr
                    key={v.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {v.logo ? (
                          <img
                            src={v.logo}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
                            {v.storeName?.[0]}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {v.storeName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {v.user?.accountInfo?.firstName}{" "}
                      {v.user?.accountInfo?.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {v.totalSales ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          v.isVerified
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {v.isVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(v.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!v.isVerified && (
                          <>
                            <button
                              onClick={() =>
                                handleVerify(v.publicId, v.storeName)
                              }
                              className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                              title="Verify"
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button
                              onClick={() => handleReject(v.publicId)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
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
            <span className="text-xs text-gray-500">{total} vendors</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs text-gray-500">
                {page} / {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / limit)}
                className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40"
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
