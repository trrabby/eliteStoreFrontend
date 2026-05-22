/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from "lucide-react";
import {
  getWallet,
  getTransactionHistory,
  initiateAddMoney,
} from "@/services/wallet.service";
import { formatBDT } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/date";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

const TX_COLORS: Record<string, string> = {
  CREDIT: "text-green-600",
  DEBIT: "text-red-500",
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"SSLCOMMERZ" | "BKASH">("SSLCOMMERZ");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const [walletRes, txRes] = await Promise.all([
      getWallet(),
      getTransactionHistory({ limit: 20 }),
    ]);
    if (walletRes?.success) setWallet(walletRes.data);
    if (txRes?.success) setTxns(txRes.data?.transactions ?? txRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddMoney = async () => {
    const amt = Number(amount);
    if (!amt || amt < 10) {
      toast.error("Minimum recharge is ৳10");
      return;
    }
    setAdding(true);
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify({ amount: amt, method }));
      const res = await initiateAddMoney(fd);
      if (res?.success && res.data?.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else if (res?.success) {
        toast.success("Money added!");
        setAmount("");
        load();
      } else {
        toast.error(res?.message ?? "Failed to initiate payment");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-bold text-gray-900">
        My Wallet
      </h2>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Balance card */}
          <div className="card p-6 bg-gradient-primary text-white overflow-hidden relative">
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1 opacity-90">
                <Wallet size={16} />
                <span className="text-sm font-medium">Available Balance</span>
              </div>
              <p className="font-display text-4xl font-bold">
                {formatBDT(wallet?.balance ?? 0)}
              </p>
              <p className="text-sm opacity-70 mt-1">
                Total spent: {formatBDT(wallet?.totalSpent ?? 0)}
              </p>
            </div>
          </div>

          {/* Add money */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={15} className="text-primary" />
              Add Money
            </h3>
            <div className="flex gap-3 mb-3">
              {(["SSLCOMMERZ", "BKASH"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all",
                    method === m
                      ? "border-primary bg-primary-pale text-primary"
                      : "border-gray-200 text-gray-600",
                  )}
                >
                  {m === "SSLCOMMERZ" ? "💳 Card" : "📱 bKash"}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (min ৳10)"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleAddMoney}
                disabled={adding}
                className="btn-primary px-5 py-3 text-sm disabled:opacity-60 flex items-center gap-2"
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
                  <Plus size={15} />
                )}
                Add
              </button>
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2 mt-3">
              {[100, 250, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(String(amt))}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-primary-pale hover:text-primary transition-all"
                >
                  +৳{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction history */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Transaction History
              </h3>
              <button
                onClick={load}
                className="p-1.5 text-gray-400 hover:text-primary transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {txns.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">
                No transactions yet
              </p>
            ) : (
              <div className="space-y-1">
                {txns.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                        tx.type === "CREDIT" ? "bg-green-50" : "bg-red-50",
                      )}
                    >
                      {tx.type === "CREDIT" ? (
                        <ArrowDownLeft size={15} className="text-green-600" />
                      ) : (
                        <ArrowUpRight size={15} className="text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tx.reason?.replace("_", " ")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDateTime(tx.createdAt)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-bold shrink-0",
                        TX_COLORS[tx.type] ?? "text-gray-600",
                      )}
                    >
                      {tx.type === "CREDIT" ? "+" : "-"}
                      {formatBDT(tx.amount)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
