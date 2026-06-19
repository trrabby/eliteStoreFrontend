/* eslint-disable prefer-const */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  CheckCircle,
  RefreshCw,
  XCircle,
  Clock,
  Wallet,
  Search,
  X,
  Filter,
  Calendar,
  Download,
  CheckSquare,
  Square,
  Eye,
  X as XIcon,
  DollarSign,
} from "lucide-react";
import {
  getAllWithdrawRequests,
  updateWithdrawRequestStatus,
  getSingleWithdrawRequest,
} from "@/services/vendorWithdraw.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Image from "next/image";
import { exportWithdrawalsToExcel } from "@/lib/utils/exportWithdrawals";

const STATUS_META: Record<string, { color: string; icon: any }> = {
  PENDING: { color: "bg-yellow-50 text-yellow-700", icon: Clock },
  PROCESSING: { color: "bg-blue-50 text-blue-700", icon: RefreshCw },
  PAID: { color: "bg-green-50 text-green-700", icon: CheckCircle },
  CANCELLED: { color: "bg-red-50 text-red-700", icon: XCircle },
};

const TABS = ["ALL", "PENDING", "PROCESSING", "PAID", "CANCELLED"];
const PAYMENT_METHODS = ["bKash", "Nagad", "Rocket", "Bank Transfer", "Other"];

const QUICK_DATES = [
  { label: "Last 1 Day", value: "1d" },
  { label: "Last 3 Days", value: "3d" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 1 Month", value: "1m" },
  { label: "Last 3 Months", value: "3m" },
];

// ─── Swal Dialog Helpers ─────────────────────────────────────

type DialogResult = {
  confirmed: boolean;
  data?: {
    processingDetails?: string;
    paidThrough?: string;
    paidOn?: string;
    cancelReason?: string;
  };
};

const showProcessDialog = async (): Promise<DialogResult> => {
  const { value, isConfirmed } = await Swal.fire({
    title: "Mark as Processing",
    html: `
      <div class="text-left mt-2">
        <label for="processing-details" class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
          Processing Details (Optional)
        </label>
        <input
          id="processing-details"
          type="text"
          class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 transition duration-200 focus:bg-white focus:border-[#ff3e9b] focus:ring-2 focus:ring-[#ff3e9b]/20 focus:outline-none"
          placeholder="e.g., Checking balance, verifying bank details..."
        />
      </div>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Process",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    background: "#ffffff",
    color: "#111827",
    buttonsStyling: false,
    customClass: {
      popup: "rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-sm",
      title: "text-xl font-bold text-gray-900 pt-2",
      htmlContainer: "m-0 p-0",
      actions: "mt-6 flex gap-3 w-full justify-end",
      confirmButton:
        "inline-flex justify-center items-center px-5 py-2.5 bg-[#ff3e9b] text-white text-sm font-semibold rounded-xl hover:bg-[#d4006f] active:scale-[0.98] transition-all duration-200 shadow-sm shadow-[#ff3e9b]/20",
      cancelButton:
        "inline-flex justify-center items-center px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-200",
    },
    preConfirm: () => {
      const input = document.getElementById(
        "processing-details",
      ) as HTMLInputElement | null;
      return { processingDetails: input?.value || undefined };
    },
  });

  if (!isConfirmed || !value) return { confirmed: false };
  return {
    confirmed: true,
    data: { processingDetails: value.processingDetails },
  };
};

const showPayDialog = async (): Promise<DialogResult> => {
  const today = new Date().toISOString().split("T")[0];

  const { value, isConfirmed } = await Swal.fire({
    title: "Mark as Paid",
    html: `
      <div class="flex flex-col gap-4 text-left mt-2">
        <div>
          <label for="pay-method" class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
            Payment Method
          </label>
          <select 
            id="pay-method" 
            class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 transition duration-200 focus:bg-white focus:border-[#ff3e9b] focus:ring-2 focus:ring-[#ff3e9b]/20 focus:outline-none"
          >
            ${PAYMENT_METHODS.map(
              (m) => `<option value="${m}">${m}</option>`,
            ).join("")}
          </select>
        </div>

        <div>
          <label for="pay-details" class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
            Payment Details
          </label>
          <input
            id="pay-details"
            type="text"
            class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 transition duration-200 focus:bg-white focus:border-[#ff3e9b] focus:ring-2 focus:ring-[#ff3e9b]/20 focus:outline-none"
            placeholder="e.g., Bkash, Personal, 01681164841..."
          />
        </div>

        <div>
          <label for="paid-on" class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
            Paid On
          </label>
          <input
            id="paid-on"
            type="date"
            class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 transition duration-200 focus:bg-white focus:border-[#ff3e9b] focus:ring-2 focus:ring-[#ff3e9b]/20 focus:outline-none"
            value="${today}"
          />
        </div>
      </div>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Mark Paid",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    background: "#ffffff",
    color: "#111827",
    buttonsStyling: false,
    customClass: {
      popup: "rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-sm",
      title: "text-xl font-bold text-gray-900 pt-2",
      htmlContainer: "m-0 p-0", // Resets swal's huge built-in margins
      actions: "mt-6 flex gap-3 w-full justify-end",
      confirmButton:
        "inline-flex justify-center items-center px-5 py-2.5 bg-[#ff3e9b] text-white text-sm font-semibold rounded-xl hover:bg-[#d4006f] active:scale-[0.98] transition-all duration-200 shadow-sm shadow-[#ff3e9b]/20",
      cancelButton:
        "inline-flex justify-center items-center px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-200",
    },
    preConfirm: () => {
      const method = document.getElementById(
        "pay-method",
      ) as HTMLSelectElement | null;
      const details = document.getElementById(
        "pay-details",
      ) as HTMLInputElement | null;
      const paidOn = document.getElementById(
        "paid-on",
      ) as HTMLInputElement | null;

      if (!method || !paidOn) return null;

      const paidThrough =
        method.value + (details?.value ? `, ${details.value}` : "");
      return { paidThrough, paidOn: paidOn.value };
    },
  });

  if (!isConfirmed || !value) return { confirmed: false };

  return {
    confirmed: true,
    data: { paidThrough: value.paidThrough, paidOn: value.paidOn },
  };
};

const showCancelDialog = async (): Promise<DialogResult> => {
  const { value, isConfirmed } = await Swal.fire({
    title: "Cancel Request",
    html: `
      <div class="text-left mt-2">
        <label for="cancel-reason" class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
          Cancellation Reason (Optional)
        </label>
        <input
          id="cancel-reason"
          type="text"
          class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 transition duration-200 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
          placeholder="e.g., Duplicate request, Vendor requested cancellation..."
        />
      </div>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Cancel It",
    cancelButtonText: "Go Back",
    reverseButtons: true,
    background: "#ffffff",
    color: "#111827",
    buttonsStyling: false,
    customClass: {
      popup: "rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-sm",
      title: "text-xl font-bold text-gray-900 pt-2",
      htmlContainer: "m-0 p-0",
      actions: "mt-6 flex gap-3 w-full justify-end",
      confirmButton:
        "inline-flex justify-center items-center px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all duration-200 shadow-sm shadow-red-500/20",
      cancelButton:
        "inline-flex justify-center items-center px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-200",
    },
    preConfirm: () => {
      const input = document.getElementById(
        "cancel-reason",
      ) as HTMLInputElement | null;
      return { cancelReason: input?.value || undefined };
    },
  });

  if (!isConfirmed || !value) return { confirmed: false };
  return { confirmed: true, data: { cancelReason: value.cancelReason } };
};
// ─── Details Modal ────────────────────────────────────────────

function RequestDetailsModal({
  requestId,
  onClose,
  onRefresh,
}: {
  requestId: number;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const res = await getSingleWithdrawRequest(requestId);
      if (res?.success) {
        setRequest(res.data);
      } else {
        toast.error("Failed to load request details");
        onClose();
      }
      setLoading(false);
    };
    fetchDetails();
  }, [requestId]);

  const handleCancel = async () => {
    if (!request) return;
    const result = await showCancelDialog();
    if (!result.confirmed) return;

    setCancelling(true);
    const fd = new FormData();
    fd.append(
      "data",
      JSON.stringify({
        status: "CANCELLED",
        cancelReason: result.data?.cancelReason,
      }),
    );
    const res = await updateWithdrawRequestStatus(request.publicId, fd);
    if (res?.success) {
      toast.success("Request cancelled. Balance restored.");
      onRefresh();
      onClose();
    } else {
      toast.error((res as any)?.message ?? "Failed");
    }
    setCancelling(false);
  };

  if (!request && !loading) return null;

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
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto
                   max-w-2xl bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              Withdraw Request
            </h3>
            <div className="flex flex-wrap items-center gap-1 mt-0.5">
              <p className="text-xs text-gray-400">ID: {request?.id}</p>
              <span className="text-xs text-gray-300">|</span>
              <p className="text-xs text-gray-400">
                Public: {request?.publicId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            <div className="skeleton h-6 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
            <div className="skeleton h-20 rounded" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Amount */}
            <div className="bg-primary-pale rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500">Requested Amount</p>
              <p className="font-display text-3xl font-bold text-primary mt-1">
                {formatBDT(request?.amount)}
              </p>
            </div>

            {/* Vendor info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              {request?.vendor?.logo ? (
                <Image
                  src={request?.vendor.logo}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover"
                  width={40}
                  height={40}
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary-pale flex items-center justify-center text-primary text-sm font-bold">
                  {request?.vendor?.storeName?.[0]}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {request?.vendor?.storeName}
                </p>
                <p className="text-xs text-gray-500">
                  Due: {formatBDT(request?.vendor?.vendorDue ?? 0)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {request?.user?.accountInfo?.firstName}{" "}
                  {request?.user?.accountInfo?.lastName} ·{" "}
                  {request?.user?.email}
                </p>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex justify-center">
              <span
                className={cn(
                  "text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1",
                  STATUS_META[request?.status]?.color,
                )}
              >
                {STATUS_META[request?.status]?.icon &&
                  (() => {
                    const Icon = STATUS_META[request?.status].icon;
                    return <Icon size={14} />;
                  })()}
                {request?.status}
              </span>
            </div>

            {/* Details grid */}
            <dl className="divide-y divide-gray-100 text-sm">
              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Payment Method</dt>
                <dd className="font-medium text-gray-900">
                  {request?.paymentMethod}
                </dd>
              </div>

              {request?.description && (
                <div className="flex justify-between py-2">
                  <dt className="text-gray-500">Note</dt>
                  <dd className="font-medium text-gray-900 max-w-50 text-right wrap-break-word">
                    {request.description}
                  </dd>
                </div>
              )}

              {request?.processingDetails && (
                <div className="flex justify-between py-2">
                  <dt className="text-gray-500">Processing Details</dt>
                  <dd className="font-medium text-gray-900 max-w-50 text-right wrap-break-word">
                    {request?.processingDetails}
                  </dd>
                </div>
              )}

              {request?.cancelReason && (
                <div className="flex justify-between py-2">
                  <dt className="text-gray-500">Cancel Reason</dt>
                  <dd className="font-medium text-gray-900 max-w-50 text-right wrap-break-word">
                    {request?.cancelReason}
                  </dd>
                </div>
              )}

              <div className="flex justify-between py-2">
                <dt className="text-gray-500">Requested</dt>
                <dd className="font-medium text-gray-900">
                  {formatDate(request?.createdAt)}
                </dd>
              </div>

              {request?.processingDetails && (
                <div className="flex justify-between py-2">
                  <dt className="text-gray-500">Processing Details</dt>
                  <dd className="font-medium text-gray-900">
                    {formatDate(request?.processingDetails)}
                  </dd>
                </div>
              )}

              {request?.paidAt && (
                <div className="flex justify-between py-2">
                  <dt className="text-gray-500">Paid At</dt>
                  <dd className="font-medium text-gray-900">
                    {formatDate(request?.paidAt)}
                  </dd>
                </div>
              )}

              {request?.cancelledAt && (
                <div className="flex justify-between py-2">
                  <dt className="text-gray-500">Cancelled At</dt>
                  <dd className="font-medium text-gray-900">
                    {formatDate(request?.cancelledAt)}
                  </dd>
                </div>
              )}

              {request?.paidThrough && (
                <div className="flex justify-between py-2">
                  <dt className="text-gray-500">Paid Through</dt>
                  <dd className="font-medium text-gray-900">
                    {request.paidThrough} on {formatDate(request?.paidOn)}
                  </dd>
                </div>
              )}

              {request?.paidBy && (
                <div className="flex justify-between py-2">
                  <dt className="text-gray-500">Paid By</dt>
                  <dd className="font-medium text-gray-900">
                    {request.paidBy.accountInfo?.firstName}{" "}
                    {request.paidBy.accountInfo?.lastName} |{" "}
                    {request.paidBy.accountInfo.user.role}
                  </dd>
                </div>
              )}
            </dl>

            {/* Cancel button (only if pending) */}
            {request.status === "PENDING" && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full btn-secondary py-2.5 text-sm flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                {cancelling ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full"
                  />
                ) : (
                  <>
                    <XCircle size={14} /> Cancel Request
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
}
// ─── Main Page ──────────────────────────────────────────────

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("PENDING");
  const [page, setPage] = useState(1);
  const limit = 15;

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [quickDate, setQuickDate] = useState("");

  // Modal
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null,
  );

  // Bulk action loading
  const [bulkLoading, setBulkLoading] = useState(false);

  // Helper: count active filters
  const activeFilterCount = () => {
    let count = 0;
    if (search) count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    return count;
  };

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setQuickDate("");
    setPage(1);
  };

  const applyQuickDate = (value: string) => {
    const now = new Date();
    let from = new Date();
    if (value === "1d") from.setDate(now.getDate() - 1);
    else if (value === "3d") from.setDate(now.getDate() - 3);
    else if (value === "7d") from.setDate(now.getDate() - 7);
    else if (value === "1m") from.setMonth(now.getMonth() - 1);
    else if (value === "3m") from.setMonth(now.getMonth() - 3);
    else return;
    setQuickDate(value);
    setDateFrom(from.toISOString().split("T")[0]);
    setDateTo(now.toISOString().split("T")[0]);
    setPage(1);
  };

  // Load data
  const load = async () => {
    setLoading(true);
    const params: any = {
      page,
      limit,
      status: tab === "ALL" ? undefined : tab,
      reqFrom: dateFrom || undefined,
      reqTo: dateTo || undefined,
      search: search || undefined,
    };
    const res = await getAllWithdrawRequests(params);
    if (res?.success) {
      setRequests(res.data?.requests ?? []);
      setTotal(res.data?.total ?? 0);
      setSummary(res.data?.summary ?? {});
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [tab, page, dateFrom, dateTo, search]);

  // Selection helpers
  const toggleSelect = (publicId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(publicId)) newSet.delete(publicId);
    else newSet.add(publicId);
    setSelectedIds(newSet);
    setSelectAll(newSet.size === requests.length && requests.length > 0);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(requests.map((r) => r.publicId)));
    }
    setSelectAll(!selectAll);
  };

  // ─── Status update with Swal ──────────────────────────────

  const handleStatusUpdate = async (
    publicId: string,
    status: "PROCESSING" | "PAID" | "CANCELLED",
  ) => {
    let dialogResult: DialogResult;
    if (status === "PROCESSING") dialogResult = await showProcessDialog();
    else if (status === "PAID") dialogResult = await showPayDialog();
    else dialogResult = await showCancelDialog();

    if (!dialogResult.confirmed) return;

    const formData = new FormData();
    const payload: any = { status };
    if (dialogResult.data?.processingDetails)
      payload.processingDetails = dialogResult.data.processingDetails;
    if (dialogResult.data?.paidThrough)
      payload.paidThrough = dialogResult.data.paidThrough;
    if (dialogResult.data?.paidOn)
      payload.paidOn = new Date(dialogResult.data.paidOn);
    if (dialogResult.data?.cancelReason)
      payload.cancelReason = dialogResult.data.cancelReason;
    formData.append("data", JSON.stringify(payload));

    const res = await updateWithdrawRequestStatus(publicId, formData);
    if (res?.success) {
      toast.success(`Request ${status.toLowerCase()}`);
      load();
    } else {
      toast.error((res as any)?.message ?? "Failed");
    }
  };

  // ─── Bulk status update with Swal ──────────────────────────

  const bulkUpdate = async (status: "PROCESSING" | "PAID" | "CANCELLED") => {
    if (selectedIds.size === 0) {
      toast.error("No requests selected");
      return;
    }

    let dialogResult: DialogResult;
    if (status === "PROCESSING") dialogResult = await showProcessDialog();
    else if (status === "PAID") dialogResult = await showPayDialog();
    else dialogResult = await showCancelDialog();

    if (!dialogResult.confirmed) return;

    setBulkLoading(true);
    const promises = Array.from(selectedIds).map(async (publicId) => {
      const fd = new FormData();
      const payload: any = { status };
      if (dialogResult.data?.processingDetails)
        payload.processingDetails = dialogResult.data.processingDetails;
      if (dialogResult.data?.paidThrough)
        payload.paidThrough = dialogResult.data.paidThrough;
      if (dialogResult.data?.paidOn) payload.paidOn = dialogResult.data.paidOn;
      if (dialogResult.data?.cancelReason)
        payload.cancelReason = dialogResult.data.cancelReason;
      return updateWithdrawRequestStatus(publicId, fd);
    });
    const results = await Promise.allSettled(promises);
    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      toast.error(`Failed to update ${failures.length} request(s)`);
    } else {
      toast.success(`Updated ${selectedIds.size} request(s) to ${status}`);
    }
    setSelectedIds(new Set());
    setSelectAll(false);
    setBulkLoading(false);
    load();
  };

  // ─── Export ────────────────────────────────────────────────

  const handleExport = async () => {
    let dataToExport = requests;
    if (selectedIds.size > 0) {
      dataToExport = requests.filter((r) => selectedIds.has(r.publicId));
    }
    if (dataToExport.length === 0) {
      toast.error("No data to export");
      return;
    }
    try {
      await exportWithdrawalsToExcel(dataToExport, dateFrom, dateTo);
      toast.success("Export started");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Vendor Withdrawals
        </h2>
        {selectedIds.size > 0 && (
          <span className="text-sm text-primary">
            {selectedIds.size} selected
          </span>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["PENDING", "PROCESSING", "PAID", "CANCELLED"].map((s) => {
          const meta = STATUS_META[s];
          const data = summary[s] ?? { count: 0, amount: 0 };
          return (
            <div key={s} className="card p-4">
              <div
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 mb-2",
                  meta.color,
                )}
              >
                <meta.icon size={11} /> {s}
              </div>
              <p className="font-bold text-gray-900">{data.count} requests</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatBDT(data.amount)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full sm:w-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setPage(1);
                setSelectedIds(new Set());
                setSelectAll(false);
              }}
              className={cn(
                "shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                tab === t
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
              )}
            >
              {t === "ALL" ? "All Requests" : t}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50/50 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={cn(
              "relative inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
              showFilters
                ? "bg-primary text-white border-primary"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
            )}
          >
            <Filter size={16} />
            {activeFilterCount() > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center shadow-sm">
                {activeFilterCount()}
              </span>
            )}
          </button>

          <button
            onClick={handleExport}
            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
            title="Export to Excel"
          >
            <Download size={16} />
          </button>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-1.5">
              {Array.from(selectedIds).some(
                (id) =>
                  requests.find((r) => r.publicId === id)?.status === "PENDING",
              ) && (
                <>
                  <button
                    onClick={() => bulkUpdate("PROCESSING")}
                    disabled={bulkLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 disabled:opacity-50"
                    title="Mark as Processing"
                  >
                    <RefreshCw size={12} /> Process
                  </button>
                  <button
                    onClick={() => bulkUpdate("CANCELLED")}
                    disabled={bulkLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 disabled:opacity-50"
                    title="Cancel"
                  >
                    <XCircle size={12} /> Cancel
                  </button>
                </>
              )}
              {Array.from(selectedIds).some(
                (id) =>
                  requests.find((r) => r.publicId === id)?.status ===
                  "PROCESSING",
              ) && (
                <button
                  onClick={() => bulkUpdate("PAID")}
                  disabled={bulkLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 disabled:opacity-50"
                  title="Mark as Paid"
                >
                  <CheckCircle size={12} /> Pay
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel with quick dates */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md mt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Date From
                  </label>
                  <div className="relative">
                    <Calendar
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setQuickDate("");
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none bg-gray-50/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Date To
                  </label>
                  <div className="relative">
                    <Calendar
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setQuickDate("");
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none bg-gray-50/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Quick Date
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_DATES.map((qd) => (
                      <button
                        key={qd.value}
                        onClick={() => applyQuickDate(qd.value)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-xs transition-all",
                          quickDate === qd.value
                            ? "bg-primary text-white border-primary"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50",
                        )}
                      >
                        {qd.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    clearFilters();
                    setShowFilters(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    setPage(1);
                    setShowFilters(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-center">
            <Wallet size={48} className="text-gray-200" />
            <p className="text-gray-500">
              No {tab.toLowerCase()} withdrawal requests.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-4 py-3 w-10">
                      <button
                        onClick={toggleSelectAll}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {selectAll ? (
                          <CheckSquare size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                      Vendor
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                      Amount
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                      Method / Note
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                      Requested
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, i) => {
                    const meta = STATUS_META[r.status] ?? STATUS_META.PENDING;
                    const isSelected = selectedIds.has(r.publicId);
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                      >
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleSelect(r.publicId)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-primary" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {r.vendor?.logo ? (
                              <Image
                                src={r.vendor.logo}
                                alt=""
                                className="w-7 h-7 rounded-lg object-cover"
                                width={28}
                                height={28}
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-primary-pale flex items-center justify-center text-primary text-xs font-bold">
                                {r.vendor?.storeName?.[0]}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {r.vendor?.storeName}
                              </p>
                              <p className="text-xs text-gray-400">
                                Due: {formatBDT(r.vendor?.vendorDue ?? 0)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-primary">
                            {formatBDT(r.amount)}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-700">
                            {r.paymentMethod}
                          </p>
                          {r.description && (
                            <p className="text-xs text-gray-400 max-w-45 truncate">
                              {r.description}
                            </p>
                          )}
                          {r.paidThrough && (
                            <p className="text-xs text-green-600">
                              Paid via {r.paidThrough}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit",
                              meta.color,
                            )}
                          >
                            <meta.icon size={11} /> {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {formatDate(r.createdAt)}
                        </td>

                        {/* Actions column with colored buttons + View */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* View button */}
                            <button
                              onClick={() => setSelectedRequestId(r.id)}
                              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>

                            {r.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(r.publicId, "PROCESSING")
                                  }
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition"
                                  title="Mark as Processing"
                                >
                                  <RefreshCw size={12} /> Process
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(r.publicId, "CANCELLED")
                                  }
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition"
                                  title="Cancel"
                                >
                                  <XIcon size={12} /> Cancel
                                </button>
                              </>
                            )}

                            {r.status === "PROCESSING" && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(r.publicId, "PAID")
                                }
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition"
                                title="Mark as Paid"
                              >
                                <DollarSign size={12} /> Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {total > limit && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">{total} requests</span>
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
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedRequestId && (
          <RequestDetailsModal
            requestId={selectedRequestId}
            onClose={() => setSelectedRequestId(null)}
            onRefresh={load}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
